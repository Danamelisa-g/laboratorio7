import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  deleteDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "./FirebaseConfig";
import { Userid } from "../../utils/Type";

export const getTasksByUserId = async (userId: string): Promise<Userid[]> => {
  try {
    console.log("Obteniendo tareas para usuario:", userId);
    const tasksRef = collection(db, "tasks");
    const q = query(tasksRef, where("userid", "==", userId)); // Corregido: era "userId", debe ser "userid"
    const snapshot = await getDocs(q);

    console.log("Documentos encontrados:", snapshot.docs.length);

    const tasks: Userid[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      console.log("Datos del documento:", data);
      return {
        id: doc.id,
        userid: data.userid,
        title: data.title || "Sin título",
        description: data.description || "",
        status: data.status || "todo",
      };
    });

    console.log("Tareas procesadas:", tasks);
    return tasks;
  } catch (error) {
    console.error("Error al obtener tareas:", error);
    return [];
  }
};

export const addTask = async (
  task: Omit<Userid, "id">
): Promise<string | null> => {
  try {
    console.log("Agregando tarea:", task);
    const tasksRef = collection(db, "tasks");
    const docRef = await addDoc(tasksRef, {
      userid: task.userid, // Asegurarse de que se guarde como "userid"
      title: task.title,
      description: task.description,
      status: task.status,
      createdAt: Timestamp.now(),
    });

    console.log("Tarea agregada con ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error al añadir tarea:", error);
    return null;
  }
};

export const updateTask = async (
  taskId: string,
  updates: Partial<Userid>
): Promise<boolean> => {
  try {
    console.log("Actualizando tarea:", taskId, updates);
    const taskRef = doc(db, "tasks", taskId);
    await updateDoc(taskRef, updates);
    console.log("Tarea actualizada exitosamente");
    return true;
  } catch (error) {
    console.error("Error al actualizar tarea:", error);
    return false;
  }
};

export const deleteTask = async (taskId: string): Promise<boolean> => {
  try {
    console.log("Eliminando tarea:", taskId);
    const taskRef = doc(db, "tasks", taskId);
    await deleteDoc(taskRef);
    console.log("Tarea eliminada exitosamente");
    return true;
  } catch (error) {
    console.error("Error al eliminar tarea:", error);
    return false;
  }
};