import { Injectable } from "@nestjs/common";
import { Insertable, Kysely, Updateable } from "kysely";
import { Database, InjectKysely, Tables } from "../../database";
import { Department } from "./department.entity";

type DepartmentSelect = keyof Tables["core.department"];

@Injectable()
export class DepartmentService {
  constructor(@InjectKysely() private readonly db: Kysely<Database>) {}

  /**
   * Creates a new department.
   * @param data - Department data to insert
   * @returns The created department's ID
   */
  public async create(data: Insertable<Department>) {
    return await this.db
      .insertInto("core.department")
      .values(data)
      .returning("id")
      .executeTakeFirst();
  }

  /**
   * Retrieves a department by ID.
   * @param id - The department's unique identifier
   * @param select - Array of column names to include in the result
   * @returns The department record with selected fields, or undefined if not found
   */
  public async getById<S extends DepartmentSelect>(id: string, select: S[]) {
    return await this.db
      .selectFrom("core.department")
      .where("id", "=", id)
      .select(select)
      .executeTakeFirst();
  }

  /**
   * Retrieves all departments.
   * @param select - Array of column names to include in the result
   * @returns Array of all department records
   */
  public async getAll<S extends DepartmentSelect>(select: S[]) {
    return await this.db
      .selectFrom("core.department")
      .select(select)
      .orderBy("name", "asc")
      .execute();
  }

  /**
   * Retrieves all root departments (departments with no parent).
   * @param select - Array of column names to include in the result
   * @returns Array of root department records
   */
  public async getRoots<S extends DepartmentSelect>(select: S[]) {
    return await this.db
      .selectFrom("core.department")
      .where("parent_id", "is", null)
      .select(select)
      .orderBy("name", "asc")
      .execute();
  }

  /**
   * Retrieves all child departments of a parent department.
   * @param parentId - The parent department's ID
   * @param select - Array of column names to include in the result
   * @returns Array of child department records
   */
  public async getChildren<S extends DepartmentSelect>(
    parentId: string,
    select: S[],
  ) {
    return await this.db
      .selectFrom("core.department")
      .where("parent_id", "=", parentId)
      .select(select)
      .orderBy("name", "asc")
      .execute();
  }

  /**
   * Retrieves the full ancestor chain of a department (parent, grandparent, etc.).
   * @param id - The department's ID to get ancestors for
   * @returns Array of ancestor departments from immediate parent to root
   */
  public async getAncestors(id: string) {
    // First collect all ancestor IDs
    const ancestorIds: string[] = [];
    let currentId: string | null = id;

    while (currentId) {
      const department = await this.db
        .selectFrom("core.department")
        .where("id", "=", currentId)
        .select(["parent_id"])
        .executeTakeFirst();

      if (!department || !department.parent_id) {
        break;
      }

      ancestorIds.push(department.parent_id);
      currentId = department.parent_id;
    }

    if (ancestorIds.length === 0) {
      return [];
    }

    // Fetch all ancestors in one query
    const ancestors = await this.db
      .selectFrom("core.department")
      .where("id", "in", ancestorIds)
      .select([
        "id",
        "name",
        "description",
        "parent_id",
        "created_at",
        "updated_at",
      ])
      .execute();

    // Sort by the order they appear in ancestorIds (immediate parent first)
    const idToIndex = new Map(ancestorIds.map((aid, i) => [aid, i]));
    return ancestors.sort(
      (a, b) => (idToIndex.get(a.id) ?? 0) - (idToIndex.get(b.id) ?? 0),
    );
  }

  /**
   * Updates a department's data.
   * @param id - The department's unique identifier
   * @param data - The fields to update
   * @returns The result of the update operation
   */
  public async update(id: string, data: Updateable<Department>) {
    return await this.db
      .updateTable("core.department")
      .where("id", "=", id)
      .set({ ...data, updated_at: new Date().toISOString() })
      .returning("id")
      .executeTakeFirst();
  }

  /**
   * Deletes a department by ID.
   * Note: Child departments will have their parent_id set to null (see migration).
   * @param id - The department's unique identifier
   * @returns The result of the delete operation
   */
  public async delete(id: string) {
    return await this.db
      .deleteFrom("core.department")
      .where("id", "=", id)
      .returning("id")
      .executeTakeFirst();
  }

  /**
   * Checks if a department exists.
   * @param id - The department's unique identifier
   * @returns True if the department exists
   */
  public async exists(id: string): Promise<boolean> {
    const result = await this.db
      .selectFrom("core.department")
      .where("id", "=", id)
      .select("id")
      .executeTakeFirst();

    return result !== undefined;
  }

  /**
   * Builds and returns the complete department tree structure.
   * Fetches all departments in one query and builds the tree in memory.
   * @returns Array of root departments with nested children
   */
  public async getTree(): Promise<DepartmentTreeNode[]> {
    const departments = await this.db
      .selectFrom("core.department")
      .select([
        "id",
        "name",
        "description",
        "parent_id",
        "created_at",
        "updated_at",
      ])
      .orderBy("name", "asc")
      .execute();

    // Create a map for quick lookup
    const departmentMap = new Map<string, DepartmentTreeNode>();
    for (const dept of departments) {
      departmentMap.set(dept.id, { ...dept, children: [] });
    }

    // Build the tree
    const roots: DepartmentTreeNode[] = [];
    for (const dept of departments) {
      const node = departmentMap.get(dept.id)!;
      if (dept.parent_id === null) {
        roots.push(node);
      } else {
        const parent = departmentMap.get(dept.parent_id);
        if (parent) {
          parent.children.push(node);
        } else {
          // Orphaned department (parent doesn't exist), treat as root
          roots.push(node);
        }
      }
    }

    return roots;
  }
}

export type DepartmentTreeNode = {
  id: string;
  name: string;
  description: string | null;
  parent_id: string | null;
  created_at: Date;
  updated_at: Date;
  children: DepartmentTreeNode[];
};
