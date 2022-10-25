import express  from "express";
import { actualizarPaciente } from "../controllers/pacienteController.js";
import { 
    autenticar, 
    confirmar,
    olvidePassword, 
    perfil, 
    registrar,
    comprobarToken,
    nuevoPassword,
    actualizarPerfil,
    actualizarPassword
} from "../controllers/veterinarioController.js";
import checkAuth from "../middleware/authMiddleware.js";

const router = express.Router( );

// Área publica
// Registrar usuarios
router.post("/", registrar);

// Confirmar los usuarios
router.get("/confirmar/:token", confirmar);

// Autenticar a los usuarios
router.post("/login", autenticar);

// Comprobar  y validar el email del usuario
router.post("/olvide-password", olvidePassword);

// Comprobar y validar el Token y almacenar el nuevo password
router.route("/olvide-password/:token").get(comprobarToken).post(nuevoPassword);

// Área privada
router.get("/perfil", checkAuth, perfil);
router.put("/perfil/:id", checkAuth, actualizarPerfil)
router.put('/actualizar-password', checkAuth, actualizarPassword)

export default router;