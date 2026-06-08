package com.stockai.backend.config;

import com.stockai.backend.model.*;
import com.stockai.backend.repository.*;
import com.stockai.backend.service.StockService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;
import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PieceRepository pieceRepository;
    private final SupplierRepository supplierRepository;
    private final SupplierPartRepository supplierPartRepository;
    private final WorkshopRequestRepository workshopRequestRepository;
    private final WorkshopRepository workshopRepository;
    private final ConsumptionHistoryRepository consumptionHistoryRepository;
    private final StockService stockService;
    private final JdbcTemplate jdbcTemplate;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public DataInitializer(UserRepository userRepository,
                           PieceRepository pieceRepository,
                           SupplierRepository supplierRepository,
                           SupplierPartRepository supplierPartRepository,
                           WorkshopRequestRepository workshopRequestRepository,
                           WorkshopRepository workshopRepository,
                           ConsumptionHistoryRepository consumptionHistoryRepository,
                           StockService stockService,
                           JdbcTemplate jdbcTemplate) {
        this.userRepository = userRepository;
        this.pieceRepository = pieceRepository;
        this.supplierRepository = supplierRepository;
        this.supplierPartRepository = supplierPartRepository;
        this.workshopRequestRepository = workshopRequestRepository;
        this.workshopRepository = workshopRepository;
        this.consumptionHistoryRepository = consumptionHistoryRepository;
        this.stockService = stockService;
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) {
        try {
            jdbcTemplate.execute("ALTER TABLE supplier_order DROP CONSTRAINT IF EXISTS supplier_order_status_check;");
            System.out.println("✅ Dropped outdated supplier_order_status_check constraint!");
        } catch (Exception e) {
            System.out.println("⚠️ Could not drop check constraint: " + e.getMessage());
        }

        if (userRepository.findByEmail("inventory@system.com").isPresent()) {
            return; // DB already seeded with our full mock data
        }

        // 1. Seed Users
        User superAdmin = createUser("admin", "admin@system.com", Role.SUPER_ADMIN);
        User admin = createUser("inventory_manager", "inventory@system.com", Role.ADMIN);
        User mechanic1 = createUser("john_mechanic", "john@workshop.com", Role.WORKSHOP);

        // 2. Seed Suppliers
        Supplier bosch = createSupplier("Bosch Autoparts", "contact@bosch.com", "555-0101", 98.5, 3);
        Supplier autozone = createSupplier("AutoZone Wholesale", "wholesale@autozone.com", "555-0202", 85.0, 5);

        // 3. Seed Pieces
        Piece brakePad = createPiece("BRK-001", "Ceramic Brake Pad", "Brakes", "HIGH", 50, admin);
        Piece oilFilter = createPiece("OIL-F-V8", "V8 Synthetic Oil Filter", "Engine", "MEDIUM", 100, admin);
        Piece sparkPlug = createPiece("SPK-P-02", "Iridium Spark Plug", "Ignition", "LOW", 200, admin);
        Piece battery = createPiece("BAT-12V", "12V Car Battery", "Electrical", "HIGH", 20, admin);

        // 4. Link Pieces to Suppliers (SupplierParts)
        createSupplierPart(bosch, brakePad, 45.00, 2, 20);
        createSupplierPart(autozone, brakePad, 42.00, 5, 50); // Cheaper but longer lead time
        createSupplierPart(bosch, oilFilter, 12.50, 3, 50);
        createSupplierPart(bosch, sparkPlug, 8.00, 3, 100);
        createSupplierPart(autozone, battery, 120.00, 7, 10);

        // 5. Initial Stock Entries
        stockService.addStock(brakePad.getId(), 55); // Just above minimum
        stockService.addStock(oilFilter.getId(), 250);
        stockService.addStock(sparkPlug.getId(), 180); // Below minimum stock! Will trigger AI Recommendation
        stockService.addStock(battery.getId(), 25);

        // 6. Simulate Workshop Requests
        createWorkshopRequest(brakePad, mechanic1, 4, WorkshopRequest.RequestStatus.PENDING);
        createWorkshopRequest(oilFilter, mechanic1, 10, WorkshopRequest.RequestStatus.APPROVED);
        stockService.removeStock(oilFilter.getId(), 10); // Deduct for the approved one

        // 7. Seed Workshops and Consumption History
        Workshop mainWorkshop = createWorkshop("Main Service Center");
        Workshop bodyShop = createWorkshop("Body & Paint Shop");

        createConsumptionHistory(brakePad, mainWorkshop, 2, LocalDateTime.now().minusDays(5));
        createConsumptionHistory(oilFilter, mainWorkshop, 5, LocalDateTime.now().minusDays(2));
        createConsumptionHistory(battery, bodyShop, 1, LocalDateTime.now().minusDays(10));
    }

    private User createUser(String username, String email, Role role) {
        return userRepository.findByEmail(email).orElseGet(() -> {
            User user = new User();
            user.setUsername(username);
            user.setEmail(email);
            user.setPassword(encoder.encode("admin123"));
            user.setRole(role);
            user.setStatus(UserStatus.ACTIVE);
            user.setApproved(true);
            user.setActive(true);
            return userRepository.save(user);
        });
    }

    private Supplier createSupplier(String name, String email, String phone, double reliability, int leadTime) {
        Supplier s = new Supplier();
        s.setName(name);
        s.setContactEmail(email);
        s.setPhone(phone);
        s.setReliabilityScore(reliability);
        s.setAverageLeadTimeDays(leadTime);
        return supplierRepository.save(s);
    }

    private Piece createPiece(String ref, String name, String category, String criticality, int minStock, User owner) {
        Piece p = new Piece();
        p.setReference(ref);
        p.setName(name);
        p.setCategory(category);
        p.setCriticality(criticality);
        p.setMinimumStock(minStock);
        p.setOwner(owner);
        return pieceRepository.save(p);
    }

    private void createSupplierPart(Supplier s, Piece p, double price, int leadTime, int moq) {
        SupplierPart sp = new SupplierPart();
        sp.setSupplier(s);
        sp.setPiece(p);
        sp.setPrice(price);
        sp.setLeadTimeDays(leadTime);
        sp.setMinimumOrderQuantity(moq);
        supplierPartRepository.save(sp);
    }

    private void createWorkshopRequest(Piece p, User mechanic, int qty, WorkshopRequest.RequestStatus status) {
        WorkshopRequest req = new WorkshopRequest();
        req.setPiece(p);
        req.setRequestedBy(mechanic);
        req.setQuantity(qty);
        req.setStatus(status);
        req.setRequestDate(LocalDateTime.now().minusDays(1)); // Requested yesterday
        workshopRequestRepository.save(req);
    }

    private Workshop createWorkshop(String name) {
        Workshop w = new Workshop();
        w.setName(name);
        return workshopRepository.save(w);
    }

    private void createConsumptionHistory(Piece p, Workshop w, int qty, LocalDateTime date) {
        ConsumptionHistory ch = new ConsumptionHistory();
        ch.setPiece(p);
        ch.setWorkshop(w);
        ch.setQuantity(qty);
        ch.setDate(date);
        consumptionHistoryRepository.save(ch);
    }
}