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
    private final ClientRepository clientRepository;
    private final ClientOrderRepository clientOrderRepository;
    private final ClientDevisRepository clientDevisRepository;
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
                           ClientRepository clientRepository,
                           ClientOrderRepository clientOrderRepository,
                           ClientDevisRepository clientDevisRepository,
                           StockService stockService,
                           JdbcTemplate jdbcTemplate) {
        this.userRepository = userRepository;
        this.pieceRepository = pieceRepository;
        this.supplierRepository = supplierRepository;
        this.supplierPartRepository = supplierPartRepository;
        this.workshopRequestRepository = workshopRequestRepository;
        this.workshopRepository = workshopRepository;
        this.consumptionHistoryRepository = consumptionHistoryRepository;
        this.clientRepository = clientRepository;
        this.clientOrderRepository = clientOrderRepository;
        this.clientDevisRepository = clientDevisRepository;
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
        Piece brakePad = createPiece("BRK-001", "Ceramic Brake Pad", "Brakes", "HIGH", 50, admin, 
            "High-performance ceramic brake pad designed for heavy duty commercial use. Lasts 30% longer than standard pads.", 
            "https://images.unsplash.com/photo-1629824647311-6677f50228d4?w=500&auto=format&fit=crop&q=60", "BAR-00010101");
            
        Piece oilFilter = createPiece("OIL-F-V8", "V8 Synthetic Oil Filter", "Engine", "MEDIUM", 100, admin,
            "Premium synthetic oil filter for V8 engines. Ensures maximum dirt trapping and optimal oil flow.",
            "https://images.unsplash.com/photo-1635773054043-42e729a6e0fb?w=500&auto=format&fit=crop&q=60", "BAR-00010102");
            
        Piece sparkPlug = createPiece("SPK-P-02", "Iridium Spark Plug", "Ignition", "LOW", 200, admin,
            "Laser iridium spark plug providing superior ignitability and long service life. Pre-gapped.",
            "https://plus.unsplash.com/premium_photo-1682126207191-2a54b38d3ab9?w=500&auto=format&fit=crop&q=60", "BAR-00010103");
            
        Piece battery = createPiece("BAT-12V", "12V Car Battery", "Electrical", "HIGH", 20, admin,
            "Heavy duty 12V 750 CCA car battery. Built to withstand extreme temperatures and vibrations.",
            "https://images.unsplash.com/photo-1610014819777-628d0551061f?w=500&auto=format&fit=crop&q=60", "BAR-00010104");

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
        
        // 8. Seed Clients
        Client acmeCorp = createClient("ACME Logistics", "logistics@acme.com", "555-8888", "ACME Corp", "123 Industrial Parkway");
        Client globalFreight = createClient("Global Freight", "ops@globalfreight.com", "555-9999", "Global Freight Ltd", "456 Commerce Blvd");

        // 9. Seed Client Orders and Devis
        createClientOrder(acmeCorp, brakePad, 10, 850.0, ClientOrder.OrderStatus.PENDING);
        createClientDevis(globalFreight, battery, 5, 750.0, ClientDevis.DevisStatus.DRAFT);
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

    private Piece createPiece(String ref, String name, String category, String criticality, int minStock, User owner, String desc, String img, String barcode) {
        Piece p = new Piece();
        p.setReference(ref);
        p.setName(name);
        p.setCategory(category);
        p.setCriticality(criticality);
        p.setMinimumStock(minStock);
        p.setOwner(owner);
        p.setDescription(desc);
        p.setImageUrl(img);
        p.setBarcode(barcode);
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

    private Client createClient(String name, String email, String phone, String company, String address) {
        Client c = new Client();
        c.setName(name);
        c.setEmail(email);
        c.setPhone(phone);
        c.setCompany(company);
        c.setAddress(address);
        return clientRepository.save(c);
    }

    private void createClientOrder(Client c, Piece p, int qty, double price, ClientOrder.OrderStatus status) {
        ClientOrder co = new ClientOrder();
        co.setClient(c);
        co.setPiece(p);
        co.setQuantity(qty);
        co.setPrice(price);
        co.setStatus(status);
        clientOrderRepository.save(co);
    }

    private void createClientDevis(Client c, Piece p, int qty, double price, ClientDevis.DevisStatus status) {
        ClientDevis cd = new ClientDevis();
        cd.setClient(c);
        cd.setPiece(p);
        cd.setQuantity(qty);
        cd.setEstimatedPrice(price);
        cd.setStatus(status);
        clientDevisRepository.save(cd);
    }
}