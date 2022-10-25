import  mongoose from "mongoose";
import bcrypt from "bcrypt";
import generarId from "../helpers/generarId.js";

// Creando el esquema
const veterinarioSchema = mongoose.Schema({
    nombre: {
        type: String,
        require: true,
        trim: true
    },
    password: {
        type: String,
        require: true 
    }, 
    email: {
        type: String,
        require: true,
        unique: true,
        trim: true
    },
    telefono: {
        type: String,
        default: null,
        trim: true
    },
    web: {
        type: String,
        default: null
    },
    token: {
        type: String,
        default: generarId()
    },
    confirmado: {
        type: Boolean,
        default: false
    }
});

// Antes de almacenar el registro
veterinarioSchema.pre('save', async function(next) {
    if(!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

veterinarioSchema.methods.comprobarPassword = async function(passwordFormulario ) {
    return bcrypt.compare(passwordFormulario, this.password);
}

// Registrando modelo en mongoose
const Veterinario = mongoose.model("Veterinario", veterinarioSchema);
export default Veterinario;