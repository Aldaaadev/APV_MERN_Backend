import Veterinario from "../models/Veterinario.js";
import generarJWT from "../helpers/generarJWT.js";
import generarId from "../helpers/generarId.js";
import emailRegistro from "../helpers/emailRegistro.js";
import emailOlvidePassword from "../helpers/emailOlvidePassword.js";

// Registrando nuevos usuarios
const registrar = async (req, res) => {

    const { email, nombre } = req.body;

    // Prevenir usuarios duplicados
    const existeUsuario = await Veterinario.findOne({email});

    if(existeUsuario) {
        const error = new Error("Usuario ya registrado");
        return res.status(400).json({msg: error.message});
    }

    try {
        // Guardar un nuevo veterinario
        const veterinario = new Veterinario(req.body);
        const veterinarioGuardado = await veterinario.save( );

        // Enviar el email
         emailRegistro( {
            email,
            nombre,
            token: veterinarioGuardado.token
         });

        res.json(veterinarioGuardado);
    } catch (error) {
        console.log(error);
    }
};

// Perfil de Veterinario
const perfil =  (req, res) => {
    const { veterinario } = req;
    res.json(  veterinario );
};

// Confirmando usuarios veterinarios
const confirmar = async (req, res) => {
    // Leer los parametros de la url
    const {token}= req.params;

    const usuarioConfirmar = await Veterinario.findOne({token});

    if(!usuarioConfirmar) {
        const error = new Error("Token no valido");
        return res.status(404).json({msg: error.message});
    }

    try {
        usuarioConfirmar.token = null;
        usuarioConfirmar.confirmado = true;
        await usuarioConfirmar.save();

        res.json({msg: "Usuario Confirmado Correctamente"});
    } catch (error) {
        console.log(error);
    }
}

// Autenticando veterinarios
const autenticar = async (req, res) => {
    const {email, password} = req.body;

    // Comprobar si el usuario existe
    const usuario = await Veterinario.findOne({email});

    // Comprobar que el usuario no existe
    if(!usuario) { 
        const error = new Error("El usuario no existe")
        return res.status(403).json({msg: error.message});
    }

    // Comprobar que la cuenta haya sido confirmada
    if(!usuario.confirmado) {
        const error = new Error('Tu cuenta no ha sido confirmada');
        return res.status(403).json({msg: error.message});
    }

    // Revisar si el password es correcto
    if(await usuario.comprobarPassword(password)) {
        // Auntenticar al usuario
        res.json({
            _id: usuario._id,
            nombre: usuario.nombre,
            email: usuario.email,
            token: generarJWT(usuario.id)
        });
    } else {
        const error = new Error("Password incorrecto");
        return res.status(403).json({msg: error.message});
    }
}

// Recuperar contraseña
const olvidePassword = async (req, res) => {
    const { email } = req.body;

    const existeVeterinario = await Veterinario.findOne({email});

    if(!existeVeterinario) {
        const error = new Error("El usuario no existe");
        res.status(400).json({msg: error.message});
    }

    try {
        // Generando token
        existeVeterinario.token = generarId( );
        // Guardando token 
        await existeVeterinario.save( );

        // Enviar Email con instrucciones 
        emailOlvidePassword({
            email,
            nombre: existeVeterinario.nombre,
            token: existeVeterinario.token
        })
        res.json({msg: "Hemos enviado un email con las instrucciones"});
    } catch (error) {
        console.log(error);
    }
}
const comprobarToken = async (req, res) => {
    const { token } = req.params;

    const tokenValido = await Veterinario.findOne({token});

    if(tokenValido) {
        // El token es valido el usuario existe
        res.json({msg: "Token válido el usuario existe"});
    } else {
        const error = new Error("Token no válido");
        return res.status(400).json({msg: error.message});
    }
}
const nuevoPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    const veterinario = await Veterinario.findOne({token});
    
    if(!veterinario) {
        const error = new Error("Hubo un error");
        return res.status(400).json({msg: error.message});
    }
    
    try {
        veterinario.token = null;
        veterinario.password = password;
        await veterinario.save( );
        res.json({msg: "Password modificado correctamente"});
    } catch (error) {
        console.log(error);
    }
}

const actualizarPerfil = async (req, res) => {
    const veterinario = await Veterinario.findById(req.params.id)
    if(!veterinario) {
        const error = new Error('Hubo un error');
        return res.status(400).json({msg: error.message});
    }

    const {email} = req.body;
    if(veterinario.email !== req.body.email) {
        const existeEmail = await Veterinario.findOne({email});

        if(existeEmail) {
            const error = new Error('El email está en uso');
            return res.status(400).json({msg: error.message});
        }
    }

    try {
        veterinario.nombre = req.body.nombre;
        veterinario.web = req.body.web;
        veterinario.telefono = req.body.telefono;

        // Guardamos en la DB para sioncronizar el backend con el frontend
        const veterinarioActualizado = await veterinario.save()
        res.json(veterinarioActualizado);
    } catch (error) {
        console.log(error);
    }
}

const actualizarPassword = async (req, res) => {
    // Leer los datos
    const { id } = req.veterinario;
    const { pwd_actual, pwd_nuevo} = req.body;

    // Comprobar que el veterinario exista
    const veterinario = await Veterinario.findById(id)
    if(!veterinario) {
        const error = new Error('Hubo un error');
        return res.status(400).json({msg: error.message});
    }
    
    // Comprobar su password
    if( await veterinario.comprobarPassword(pwd_actual)) {
        // Almacenar el nuevo password
        veterinario.password = pwd_nuevo;
        veterinario.save();
        res.json({msg : 'Password Almacenado Correctamente'})
    } else {
        const error = new Error('El Password Actual es Incorrecto');
        return res.status(400).json({msg: error.message});
    }

   
}

export {
    registrar,
    perfil,
    confirmar,
    autenticar,
    olvidePassword,
    comprobarToken,
    nuevoPassword,
    actualizarPerfil,
    actualizarPassword
}