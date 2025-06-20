/* eslint-disable @typescript-eslint/no-explicit-any */
import { Client } from "@notionhq/client"

// Initialize the Notion client with the API key
const notion = new Client({
  auth: process.env.NOTION_API_KEY,
})

// Function to list all databases
export async function listDatabases() {
  try {
    const response = await notion.search({
      filter: {
        value: "database",
        property: "object",
      },
    })
    return response.results
  } catch (error) {
    console.error("Error fetching databases:", error)
    throw new Error("Failed to fetch databases")
  }
}

// Function to get a specific database
export async function getDatabase(databaseId: string) {
  try {
    const database = await notion.databases.retrieve({
      database_id: databaseId,
    })
    return database
  } catch (error) {
    console.error(`Error fetching database ${databaseId}:`, error)
    throw new Error("Failed to fetch database")
  }
}

// Function to query database entries
export async function getDatabaseEntries(databaseId: string) {
  try {
    const response = await notion.databases.query({
      database_id: databaseId,
    })
    return response.results
  } catch (error) {
    console.error(`Error fetching entries for database ${databaseId}:`, error)
    throw new Error("Failed to fetch database entries")
  }
}

// Function to create a new database
export async function createDatabase(title: string, properties: any, parentPageId: string) {
  try {
    const response = await notion.databases.create({
      parent: {
        type: "page_id",
        page_id: parentPageId,
      },
      title: [
        {
          type: "text",
          text: {
            content: title,
          },
        },
      ],
      properties,
    })
    return response
  } catch (error) {
    console.error("Error creating database:", error)
    throw new Error("Failed to create database")
  }
}

// Function to create a new page (entry) in a database
export async function createDatabaseEntry(databaseId: string, properties: any) {
  try {
    const response = await notion.pages.create({
      parent: {
        database_id: databaseId,
      },
      properties,
    })
    return response
  } catch (error) {
    console.error(`Error creating entry in database ${databaseId}:`, error)
    throw new Error("Failed to create database entry")
  }
}

// Function to update a page (entry) in a database
export async function updateDatabaseEntry(pageId: string, properties: any) {
  try {
    const response = await notion.pages.update({
      page_id: pageId,
      properties,
    })
    return response
  } catch (error) {
    console.error(`Error updating page ${pageId}:`, error)
    throw new Error("Failed to update database entry")
  }
}

// Function to delete a page (entry) in a database
export async function deleteDatabaseEntry(pageId: string) {
  try {
    const response = await notion.pages.update({
      page_id: pageId,
      archived: true,
    })
    return response
  } catch (error) {
    console.error(`Error deleting page ${pageId}:`, error)
    throw new Error("Failed to delete database entry")
  }
}

// Function to get user information
export async function getCurrentUser() {
  try {
    const response = await notion.users.me({})
    return response
  } catch (error) {
    console.error("Error fetching current user:", error)
    throw new Error("Failed to fetch user information")
  }
}

// Function to list all pages (to find parent pages for database creation)
export async function listPages() {
  try {
    const response = await notion.search({
      filter: {
        value: "page",
        property: "object",
      },
    })
    return response.results
  } catch (error) {
    console.error("Error fetching pages:", error)
    throw new Error("Failed to fetch pages")
  }
}

// Function to create a new page
export async function createPage(parentId: string, title: string, content?: string) {
  try {
    const response = await notion.pages.create({
      parent: {
        page_id: parentId,
      },
      properties: {
        title: {
          title: [
            {
              text: {
                content: title,
              },
            },
          ],
        },
      },
      children: content
        ? [
            {
              object: "block",
              type: "paragraph",
              paragraph: {
                rich_text: [
                  {
                    type: "text",
                    text: {
                      content,
                    },
                  },
                ],
              },
            },
          ]
        : [],
    })
    return response
  } catch (error) {
    console.error(`Error creating page under ${parentId}:`, error)
    throw new Error("Failed to create page")
  }
}

// Function to get a specific page
export async function getPage(pageId: string) {
  try {
    const page = await notion.pages.retrieve({
      page_id: pageId,
    })
    return page
  } catch (error) {
    console.error(`Error fetching page ${pageId}:`, error)
    throw new Error("Failed to fetch page")
  }
}

// Helper function to convert Notion property types to a format for database creation
export function createPropertyObject(type: string, name: string, options?: any[]) {
  switch (type) {
    case "title":
      return { [name]: { title: {} } }
    case "rich_text":
      return { [name]: { rich_text: {} } }
    case "number":
      return { [name]: { number: {} } }
    case "select":
      return {
        [name]: {
          select: {
            options: options || [],
          },
        },
      }
    case "multi_select":
      return {
        [name]: {
          multi_select: {
            options: options || [],
          },
        },
      }
    case "date":
      return { [name]: { date: {} } }
    case "checkbox":
      return { [name]: { checkbox: {} } }
    case "url":
      return { [name]: { url: {} } }
    case "email":
      return { [name]: { email: {} } }
    case "phone_number":
      return { [name]: { phone_number: {} } }
    default:
      return { [name]: { rich_text: {} } }
  }
}

// Helper function to format properties for page creation
export function formatPropertiesForPage(properties: any, values: any) {
  const formattedProperties: any = {}

  Object.entries(properties).forEach(([key, property]: [string, any]) => {
    const value = values[key]

    if (!value && property.type !== "checkbox") return

    switch (property.type) {
      case "title":
        formattedProperties[key] = {
          title: [{ text: { content: value || "" } }],
        }
        break
      case "rich_text":
        formattedProperties[key] = {
          rich_text: [{ text: { content: value || "" } }],
        }
        break
      case "number":
        if (value !== undefined && value !== "") {
          formattedProperties[key] = { number: Number.parseFloat(value) }
        }
        break
      case "select":
        if (value) {
          formattedProperties[key] = { select: { name: value } }
        }
        break
      case "multi_select":
        if (Array.isArray(value) && value.length > 0) {
          formattedProperties[key] = {
            multi_select: value.map((name) => ({ name })),
          }
        }
        break
      case "date":
        if (value) {
          formattedProperties[key] = { date: { start: value } }
        }
        break
      case "checkbox":
        formattedProperties[key] = { checkbox: Boolean(value) }
        break
      case "url":
        if (value) {
          formattedProperties[key] = { url: value }
        }
        break
      case "email":
        if (value) {
          formattedProperties[key] = { email: value }
        }
        break
      case "phone_number":
        if (value) {
          formattedProperties[key] = { phone_number: value }
        }
        break
    }
  })

  return formattedProperties
}

// Helper function to extract values from Notion page properties
export function extractValuesFromPage(page: any) {
  const values: any = {}

  Object.entries(page.properties).forEach(([key, property]: [string, any]) => {
    switch (property.type) {
      case "title":
        values[key] = property.title.map((t: any) => t.plain_text).join("")
        break
      case "rich_text":
        values[key] = property.rich_text.map((t: any) => t.plain_text).join("")
        break
      case "number":
        values[key] = property.number
        break
      case "select":
        values[key] = property.select?.name || ""
        break
      case "multi_select":
        values[key] = property.multi_select.map((s: any) => s.name)
        break
      case "date":
        values[key] = property.date?.start || ""
        break
      case "checkbox":
        values[key] = property.checkbox
        break
      case "url":
        values[key] = property.url || ""
        break
      case "email":
        values[key] = property.email || ""
        break
      case "phone_number":
        values[key] = property.phone_number || ""
        break
    }
  })

  return values
}
