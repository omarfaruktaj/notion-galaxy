/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { revalidatePath } from "next/cache";
import {
  listDatabases,
  getDatabase,
  getDatabaseEntries,
  createDatabase,
  createDatabaseEntry,
  updateDatabaseEntry,
  deleteDatabaseEntry,
  listPages,
  createPropertyObject,
  formatPropertiesForPage,
  createPage,
  getPage,
} from "@/lib/notion";

export async function fetchDatabases() {
  try {
    const databases = await listDatabases();
    return { success: true, data: databases };
  } catch (error) {
    console.error("Error in fetchDatabases:", error);
    return { success: false, error: "Failed to fetch databases" };
  }
}

export async function fetchDatabase(databaseId: string) {
  try {
    const database = (await getDatabase(databaseId)) as any;
    return { success: true, data: database };
  } catch (error) {
    console.error(`Error in fetchDatabase for ${databaseId}:`, error);
    return { success: false, error: "Failed to fetch database" };
  }
}

export async function fetchDatabaseEntries(databaseId: string) {
  try {
    const entries = await getDatabaseEntries(databaseId);
    return { success: true, data: entries };
  } catch (error) {
    console.error(`Error in fetchDatabaseEntries for ${databaseId}:`, error);
    return { success: false, error: "Failed to fetch database entries" };
  }
}

export async function fetchPages() {
  try {
    const pages = await listPages();
    return { success: true, data: pages };
  } catch (error) {
    console.error("Error in fetchPages:", error);
    return { success: false, error: "Failed to fetch pages" };
  }
}

export async function fetchPage(pageId: string) {
  try {
    const page = await getPage(pageId);
    return { success: true, data: page };
  } catch (error) {
    console.error(`Error in fetchPage for ${pageId}:`, error);
    return { success: false, error: "Failed to fetch page" };
  }
}

export async function createNewPage(
  parentId: string,
  title: string,
  content?: string
) {
  try {
    const page = await createPage(parentId, title, content);
    revalidatePath("/", "layout");

    return { success: true, data: page };
  } catch (error) {
    console.error("Error in createNewPage:", error);
    return { success: false, error: "Failed to create page" };
  }
}

export async function createNewDatabase(
  title: string,
  properties: any[],
  parentPageId: string
) {
  try {
    // Convert properties array to Notion properties object
    let propertiesObject: any = {};

    // Always include a title property
    propertiesObject["Name"] = { title: {} };

    // Add other properties
    properties.forEach((prop) => {
      const { name, type, options } = prop;
      const propertyObj = createPropertyObject(type, name, options);
      propertiesObject = { ...propertiesObject, ...propertyObj };
    });

    const database = await createDatabase(
      title,
      propertiesObject,
      parentPageId
    );
    revalidatePath("/", "layout");
    return { success: true, data: database };
  } catch (error) {
    console.error("Error in createNewDatabase:", error);
    return { success: false, error: "Failed to create database" };
  }
}

export async function createNewDatabaseWithJSON(
  title: string,
  properties: any[],
  parentPageId: string
) {
  try {
    // Convert properties array to Notion properties object
    const propertiesObject = properties;

    const database = await createDatabase(
      title,
      propertiesObject,
      parentPageId
    );
    revalidatePath("/");
    return { success: true, data: database };
  } catch (error) {
    console.error("Error in createNewDatabase:", error);
    return { success: false, error: "Failed to create database" };
  }
}

export async function createNewDatabaseEntry(
  databaseId: string,
  properties: any,
  values: any
) {
  try {
    const formattedProperties = formatPropertiesForPage(properties, values);
    const entry = await createDatabaseEntry(databaseId, formattedProperties);
    revalidatePath(`/(root)/database/${databaseId}`, "page");
    return { success: true, data: entry };
  } catch (error) {
    console.error(`Error in createNewDatabaseEntry for ${databaseId}:`, error);
    return { success: false, error: "Failed to create database entry" };
  }
}

export async function updateExistingDatabaseEntry(
  pageId: string,
  databaseId: string,
  properties: any,
  values: any
) {
  try {
    const formattedProperties = formatPropertiesForPage(properties, values);
    const entry = await updateDatabaseEntry(pageId, formattedProperties);
    revalidatePath(`/(root)/database/${databaseId}`, "page");
    return { success: true, data: entry };
  } catch (error) {
    console.error(`Error in updateExistingDatabaseEntry for ${pageId}:`, error);
    return { success: false, error: "Failed to update database entry" };
  }
}

export async function deleteExistingDatabaseEntry(
  pageId: string,
  databaseId: string
) {
  try {
    await deleteDatabaseEntry(pageId);
    revalidatePath(`/(root)/database/${databaseId}`, "page");
    return { success: true };
  } catch (error) {
    console.error(`Error in deleteExistingDatabaseEntry for ${pageId}:`, error);
    return { success: false, error: "Failed to delete database entry" };
  }
}
