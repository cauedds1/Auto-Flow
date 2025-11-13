import { 
  type User, 
  type InsertUser,
  type Vehicle,
  type InsertVehicle,
  type VehicleImage,
  type InsertVehicleImage,
  type VehicleHistory,
  type InsertVehicleHistory,
  type VehicleCost,
  type InsertVehicleCost,
  type StoreObservation,
  type InsertStoreObservation,
  users,
  vehicles,
  vehicleImages,
  vehicleHistory,
  vehicleCosts,
  storeObservations,
} from "@shared/schema";
import { normalizeChecklistData } from "@shared/checklistUtils";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getAllVehicles(): Promise<Vehicle[]>;
  getVehicle(id: string): Promise<Vehicle | undefined>;
  createVehicle(vehicle: InsertVehicle): Promise<Vehicle>;
  updateVehicle(id: string, vehicle: Partial<InsertVehicle>): Promise<Vehicle | undefined>;
  deleteVehicle(id: string): Promise<boolean>;
  
  getVehicleImages(vehicleId: string): Promise<VehicleImage[]>;
  addVehicleImage(image: InsertVehicleImage): Promise<VehicleImage>;
  updateVehicleImage(id: string, updates: Partial<InsertVehicleImage>): Promise<VehicleImage | null>;
  deleteVehicleImage(id: string): Promise<boolean>;
  
  getVehicleHistory(vehicleId: string): Promise<VehicleHistory[]>;
  addVehicleHistory(history: InsertVehicleHistory): Promise<VehicleHistory>;
  
  getAllCosts(): Promise<VehicleCost[]>;
  getVehicleCosts(vehicleId: string): Promise<VehicleCost[]>;
  addVehicleCost(cost: InsertVehicleCost): Promise<VehicleCost>;
  updateVehicleCost(id: string, updates: Partial<InsertVehicleCost>): Promise<VehicleCost | undefined>;
  deleteCost(id: string): Promise<boolean>;
  
  getAllStoreObservations(): Promise<StoreObservation[]>;
  getStoreObservation(id: string): Promise<StoreObservation | undefined>;
  createStoreObservation(observation: InsertStoreObservation): Promise<StoreObservation>;
  updateStoreObservation(id: string, updates: Partial<InsertStoreObservation>): Promise<StoreObservation | undefined>;
  deleteStoreObservation(id: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async getAllVehicles(): Promise<Vehicle[]> {
    const vehiclesList = await db.select().from(vehicles).orderBy(desc(vehicles.createdAt));
    return vehiclesList.map(v => ({
      ...v,
      checklist: normalizeChecklistData(v.checklist)
    }));
  }

  async getVehicle(id: string): Promise<Vehicle | undefined> {
    const result = await db.select().from(vehicles).where(eq(vehicles.id, id));
    if (!result[0]) return undefined;
    return {
      ...result[0],
      checklist: normalizeChecklistData(result[0].checklist)
    };
  }

  async createVehicle(insertVehicle: InsertVehicle): Promise<Vehicle> {
    const dataToInsert = {
      ...insertVehicle,
      checklist: insertVehicle.checklist ? normalizeChecklistData(insertVehicle.checklist) : {}
    };
    const result = await db.insert(vehicles).values(dataToInsert as any).returning();
    return {
      ...result[0],
      checklist: normalizeChecklistData(result[0].checklist)
    };
  }

  async updateVehicle(id: string, updates: Partial<InsertVehicle>): Promise<Vehicle | undefined> {
    const dataToUpdate = {
      ...updates,
      checklist: updates.checklist ? normalizeChecklistData(updates.checklist) : undefined,
      updatedAt: new Date()
    };
    const result = await db.update(vehicles)
      .set(dataToUpdate as any)
      .where(eq(vehicles.id, id))
      .returning();
    if (!result[0]) return undefined;
    return {
      ...result[0],
      checklist: normalizeChecklistData(result[0].checklist)
    };
  }

  async deleteVehicle(id: string): Promise<boolean> {
    const result = await db.delete(vehicles).where(eq(vehicles.id, id)).returning();
    return result.length > 0;
  }

  async getVehicleImages(vehicleId: string): Promise<VehicleImage[]> {
    return await db.select().from(vehicleImages)
      .where(eq(vehicleImages.vehicleId, vehicleId))
      .orderBy(vehicleImages.order);
  }

  async addVehicleImage(insertImage: InsertVehicleImage): Promise<VehicleImage> {
    const result = await db.insert(vehicleImages).values(insertImage).returning();
    return result[0];
  }

  async updateVehicleImage(id: string, updates: Partial<InsertVehicleImage>): Promise<VehicleImage | null> {
    const result = await db.update(vehicleImages)
      .set(updates)
      .where(eq(vehicleImages.id, id))
      .returning();
    return result[0] || null;
  }

  async deleteVehicleImage(id: string): Promise<boolean> {
    const result = await db.delete(vehicleImages).where(eq(vehicleImages.id, id)).returning();
    return result.length > 0;
  }

  async getVehicleHistory(vehicleId: string): Promise<VehicleHistory[]> {
    return await db.select().from(vehicleHistory)
      .where(eq(vehicleHistory.vehicleId, vehicleId))
      .orderBy(desc(vehicleHistory.createdAt));
  }

  async addVehicleHistory(insertHistory: InsertVehicleHistory): Promise<VehicleHistory> {
    const result = await db.insert(vehicleHistory).values(insertHistory).returning();
    return result[0];
  }

  async getHistoryEntry(id: string): Promise<VehicleHistory | null> {
    const result = await db.select().from(vehicleHistory)
      .where(eq(vehicleHistory.id, id))
      .limit(1);
    return result[0] || null;
  }

  async updateVehicleHistory(id: string, vehicleId: string, updates: Partial<InsertVehicleHistory>): Promise<VehicleHistory | null> {
    const result = await db.update(vehicleHistory)
      .set(updates)
      .where(and(eq(vehicleHistory.id, id), eq(vehicleHistory.vehicleId, vehicleId)))
      .returning();
    
    return result[0] || null;
  }

  async getAllCosts(): Promise<VehicleCost[]> {
    return await db.select().from(vehicleCosts)
      .orderBy(desc(vehicleCosts.date));
  }

  async getVehicleCosts(vehicleId: string): Promise<VehicleCost[]> {
    return await db.select().from(vehicleCosts)
      .where(eq(vehicleCosts.vehicleId, vehicleId))
      .orderBy(desc(vehicleCosts.date));
  }

  async addVehicleCost(insertCost: InsertVehicleCost): Promise<VehicleCost> {
    const result = await db.insert(vehicleCosts).values(insertCost).returning();
    return result[0];
  }

  async updateVehicleCost(id: string, updates: Partial<InsertVehicleCost>): Promise<VehicleCost | undefined> {
    const result = await db.update(vehicleCosts)
      .set(updates)
      .where(eq(vehicleCosts.id, id))
      .returning();
    return result[0];
  }

  async deleteCost(id: string): Promise<boolean> {
    const result = await db.delete(vehicleCosts).where(eq(vehicleCosts.id, id)).returning();
    return result.length > 0;
  }

  async getAllStoreObservations(): Promise<StoreObservation[]> {
    return await db.select().from(storeObservations)
      .orderBy(desc(storeObservations.createdAt));
  }

  async getStoreObservation(id: string): Promise<StoreObservation | undefined> {
    const result = await db.select().from(storeObservations)
      .where(eq(storeObservations.id, id));
    return result[0];
  }

  async createStoreObservation(insertObservation: InsertStoreObservation): Promise<StoreObservation> {
    const result = await db.insert(storeObservations).values(insertObservation).returning();
    return result[0];
  }

  async updateStoreObservation(id: string, updates: Partial<InsertStoreObservation>): Promise<StoreObservation | undefined> {
    const finalUpdates: any = { ...updates, updatedAt: new Date() };
    
    if (updates.status === "Resolvido" && !updates.resolvedAt) {
      finalUpdates.resolvedAt = new Date();
    } else if (updates.status === "Pendente") {
      finalUpdates.resolvedAt = null;
    }

    const result = await db.update(storeObservations)
      .set(finalUpdates)
      .where(eq(storeObservations.id, id))
      .returning();
    return result[0];
  }

  async deleteStoreObservation(id: string): Promise<boolean> {
    const result = await db.delete(storeObservations).where(eq(storeObservations.id, id)).returning();
    return result.length > 0;
  }
}

export const storage = new DatabaseStorage();
