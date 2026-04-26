import { MongoServerError, ObjectId, OptionalId, WithId } from "mongodb";
import { HttpError } from "../../shared/errors/http-error";
import { Category, CategoryStatus } from "./category.model";
import { CategoryRepository } from "./category.repository";

export interface CreateCategoryInput {
  description?: string;
  name: string;
  parentId?: string;
  slug?: string;
  status?: CategoryStatus;
}

export type UpdateCategoryInput = Partial<CreateCategoryInput>;

export class CategoryService {
  private categoryRepository: CategoryRepository;

  constructor({
    categoryRepository,
  }: {
    categoryRepository: CategoryRepository;
  }) {
    this.categoryRepository = categoryRepository;
  }

  public async findAll(): Promise<WithId<Category>[]> {
    return this.categoryRepository.findAll({ status: "active" });
  }

  public async findById(id: string): Promise<WithId<Category>> {
    const category = await this.categoryRepository.findById(this.toObjectId(id));

    if (!category) {
      throw new HttpError(404, "Category not found");
    }

    return category;
  }

  public async findBySlug(slug: string): Promise<WithId<Category>> {
    const category = await this.categoryRepository.findBySlug(slug);

    if (!category) {
      throw new HttpError(404, "Category not found");
    }

    return category;
  }

  public async create(input: CreateCategoryInput): Promise<WithId<Category>> {
    await this.assertParentExists(input.parentId);

    const now = new Date();
    const document: OptionalId<Category> = {
      description: input.description,
      name: input.name,
      parentId: input.parentId ? this.toObjectId(input.parentId) : undefined,
      slug: this.createSlug(input.slug || input.name),
      status: input.status || "active",
      createdAt: now,
      updatedAt: now,
    };

    try {
      const insertedId = await this.categoryRepository.insert(document);
      return this.findById(insertedId.toHexString());
    } catch (error) {
      this.handleWriteError(error);
    }
  }

  public async update(
    id: string,
    input: UpdateCategoryInput,
  ): Promise<WithId<Category>> {
    await this.assertParentExists(input.parentId);

    const update: Partial<Category> = {
      description: input.description,
      name: input.name,
      parentId: input.parentId ? this.toObjectId(input.parentId) : undefined,
      status: input.status,
      updatedAt: new Date(),
    };

    if (input.slug || input.name) {
      update.slug = this.createSlug(input.slug || input.name || "");
    }

    Object.keys(update).forEach((key) => {
      if (update[key as keyof Category] === undefined) {
        delete update[key as keyof Category];
      }
    });

    try {
      const result = await this.categoryRepository.update(this.toObjectId(id), update);

      if (result.matchedCount === 0) {
        throw new HttpError(404, "Category not found");
      }

      return this.findById(id);
    } catch (error) {
      this.handleWriteError(error);
    }
  }

  public async archive(id: string): Promise<void> {
    const result = await this.categoryRepository.update(this.toObjectId(id), {
      status: "archived",
      updatedAt: new Date(),
    });

    if (result.matchedCount === 0) {
      throw new HttpError(404, "Category not found");
    }
  }

  private async assertParentExists(parentId?: string): Promise<void> {
    if (!parentId) {
      return;
    }

    const parent = await this.categoryRepository.findById(this.toObjectId(parentId));

    if (!parent || parent.status === "archived") {
      throw new HttpError(400, "Parent category is invalid");
    }
  }

  private createSlug(value: string): string {
    const slug = value
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    if (!slug) {
      throw new HttpError(400, "Category slug is invalid");
    }

    return slug;
  }

  private toObjectId(id: string): ObjectId {
    if (!ObjectId.isValid(id)) {
      throw new HttpError(400, "Invalid category id");
    }

    return new ObjectId(id);
  }

  private handleWriteError(error: unknown): never {
    if (error instanceof MongoServerError && error.code === 11000) {
      throw new HttpError(409, "Category slug already exists");
    }

    throw error;
  }
}
