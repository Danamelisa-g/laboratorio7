import { 
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  User,
  signOut,
  onAuthStateChanged
} from "firebase/auth";
import { auth, db } from "./FirebaseConfig";
import { doc, setDoc, getDoc } from "firebase/firestore";

// Tipos para las respuestas
interface AuthResponse {
  success: boolean;
  user?: User;
  userData?: any;
  error?: any;
}

// Función para registrar usuario - CORREGIDA
export const registerUser = async (
  email: string,
  password: string,
  confirmPassword: string // Agregado parámetro que faltaba
): Promise<AuthResponse> => {
  try {
    console.log("Registrando usuario:", email);
    
    // Crear usuario en Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Guardar información adicional en Firestore
    await setDoc(doc(db, "users", user.uid), {
      email,
      createdAt: new Date(),
    });

    console.log("Usuario registrado exitosamente:", user.uid);

    // Guardar en sessionStorage para persistencia durante la sesión
    sessionStorage.setItem("userId", user.uid);
    sessionStorage.setItem("userEmail", user.email || "");

    return { success: true, user };
  } catch (error: any) {
    console.error("Error al registrar usuario:", error);
    let errorMessage = "Error al registrar usuario";
    
    if (error.code === "auth/email-already-in-use") {
      errorMessage = "Este correo ya está registrado";
    } else if (error.code === "auth/weak-password") {
      errorMessage = "La contraseña debe tener al menos 6 caracteres";
    } else if (error.code === "auth/invalid-email") {
      errorMessage = "El correo electrónico no es válido";
    }
    
    return { success: false, error: errorMessage };
  }
};

// Función para iniciar sesión
export const loginUser = async (
  email: string, 
  password: string
): Promise<AuthResponse> => {
  try {
    console.log("Iniciando sesión:", email);
    
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Obtener información adicional del usuario desde Firestore
    const userDoc = await getDoc(doc(db, "users", user.uid));
    const userData = userDoc.data();

    console.log("Usuario autenticado exitosamente:", user.uid);

    // Guardar en sessionStorage para persistencia durante la sesión
    sessionStorage.setItem("userId", user.uid);
    sessionStorage.setItem("userEmail", user.email || "");

    return { success: true, user, userData };
  } catch (error: any) {
    console.error("Error al iniciar sesión:", error);
    let errorMessage = "Error al iniciar sesión";
    
    if (error.code === "auth/user-not-found") {
      errorMessage = "Usuario no encontrado";
    } else if (error.code === "auth/wrong-password") {
      errorMessage = "Contraseña incorrecta";
    } else if (error.code === "auth/invalid-email") {
      errorMessage = "El correo electrónico no es válido";
    } else if (error.code === "auth/too-many-requests") {
      errorMessage = "Demasiados intentos fallidos. Intenta más tarde";
    }
    
    return { success: false, error: errorMessage };
  }
};

// Función para cerrar sesión
export const logoutUser = async (): Promise<{ success: boolean; error?: any }> => {
  try {
    await signOut(auth);
    
    // Limpiar sessionStorage
    sessionStorage.removeItem("userId");
    sessionStorage.removeItem("userEmail");
    
    console.log("Sesión cerrada exitosamente");
    return { success: true };
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
    return { success: false, error };
  }
};

// Función para verificar el estado de autenticación
export const checkAuthState = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log("Usuario autenticado detectado:", user.uid);
      // Usuario autenticado, guardar datos
      sessionStorage.setItem("userId", user.uid);
      sessionStorage.setItem("userEmail", user.email || "");
    } else {
      console.log("No hay usuario autenticado");
      // Usuario no autenticado, limpiar datos
      sessionStorage.removeItem("userId");
      sessionStorage.removeItem("userEmail");
    }
    callback(user);
  });
};

// Función para obtener el usuario actual
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

// Función para obtener datos del usuario desde Firestore
export const getUserData = async (userId: string) => {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (userDoc.exists()) {
      return { success: true, data: userDoc.data() };
    } else {
      return { success: false, error: "Usuario no encontrado" };
    }
  } catch (error) {
    console.error("Error al obtener datos del usuario:", error);
    return { success: false, error };
  }
};

// Función helper para obtener el ID del usuario desde sessionStorage
export const getCurrentUserId = (): string | null => {
  const userId = sessionStorage.getItem("userId");
  console.log("UserId desde sessionStorage:", userId);
  return userId;
};

// Función helper para obtener el email del usuario desde sessionStorage
export const getCurrentUserEmail = (): string | null => {
  return sessionStorage.getItem("userEmail");
};