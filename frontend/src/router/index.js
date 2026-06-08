import { auth } from "@/auth/auth";
router.beforeEach((to, from, next) => {
  const role = auth.role;
  const token = auth.token;

  if (to.meta.requiresAuth && !token) {
    return next("/login");
  }

  if (to.meta.role && to.meta.role !== role) {
    return next("/unauthorized");
  }

  next();
});