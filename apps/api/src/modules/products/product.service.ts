import {
  Collection,
  Db,
  Filter,
  MongoServerError,
  ObjectId,
  OptionalId,
  WithId,
} from "mongodb";
import { HttpError } from "../../shared/errors/http-error";
import { Product, ProductStatus } from "./product.model";

const COLLECTION_NAME = "products";

export interface CreateProductInput {
  name: string;
  slug?: string;
  description?: string;
  price: number;
  stock: number;
  category?: string;
  images?: string[];
  status?: ProductStatus;
}

export type UpdateProductInput = Partial<CreateProductInput>;

export interface ProductQuery {
  category?: string;
  status?: ProductStatus;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedProducts {
  items: WithId<Product>[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export class ProductService {
  private collection: Collection<Product>;

  constructor({ db }: { db: Db }) {
    this.collection = db.collection<Product>(COLLECTION_NAME);
  }

  public async findAll(query: ProductQuery = {}): Promise<PaginatedProducts> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const filter = this.buildFilter(query);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.collection
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      this.collection.countDocuments(filter),
    ]);

    return {
      items,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  public async findById(id: string): Promise<WithId<Product>> {
    const product = await this.collection.findOne({ _id: this.toObjectId(id) });

    if (!product) {
      throw new HttpError(404, "Product not found");
    }

    return product;
  }

  public async findBySlug(slug: string): Promise<WithId<Product>> {
    const product = await this.collection.findOne({ slug });

    if (!product) {
      throw new HttpError(404, "Product not found");
    }

    return product;
  }

  public async create(input: CreateProductInput): Promise<WithId<Product>> {
    const now = new Date();
    const document: OptionalId<Product> = {
      ...input,
      slug: this.createSlug(input.slug || input.name),
      images: input.images || [],
      status: input.status || "draft",
      createdAt: now,
      updatedAt: now,
    };

    try {
      const result = await this.collection.insertOne(document);
      return this.findById(result.insertedId.toHexString());
    } catch (error) {
      this.handleWriteError(error);
    }
  }

  public async update(
    id: string,
    input: UpdateProductInput,
  ): Promise<WithId<Product>> {
    const update: UpdateProductInput & { updatedAt: Date; slug?: string } = {
      ...input,
      updatedAt: new Date(),
    };

    if (input.slug || input.name) {
      update.slug = this.createSlug(input.slug || input.name || "");
    }

    try {
      const result = await this.collection.updateOne(
        { _id: this.toObjectId(id) },
        { $set: update },
      );

      if (result.matchedCount === 0) {
        throw new HttpError(404, "Product not found");
      }

      return this.findById(id);
    } catch (error) {
      this.handleWriteError(error);
    }
  }

  public async delete(id: string): Promise<void> {
    const result = await this.collection.deleteOne({ _id: this.toObjectId(id) });

    if (result.deletedCount === 0) {
      throw new HttpError(404, "Product not found");
    }
  }

  private buildFilter(query: ProductQuery): Filter<Product> {
    const filter: Filter<Product> = {};

    if (query.category) {
      filter.category = query.category;
    }

    if (query.status) {
      filter.status = query.status;
    }

    if (query.search) {
      const escapedSearch = this.escapeRegex(query.search);

      filter.$or = [
        { name: { $regex: escapedSearch, $options: "i" } },
        { description: { $regex: escapedSearch, $options: "i" } },
      ];
    }

    return filter;
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
      throw new HttpError(400, "Product slug is invalid");
    }

    return slug;
  }

  private escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  private toObjectId(id: string): ObjectId {
    if (!ObjectId.isValid(id)) {
      throw new HttpError(400, "Invalid product id");
    }

    return new ObjectId(id);
  }

  private handleWriteError(error: unknown): never {
    if (error instanceof MongoServerError && error.code === 11000) {
      throw new HttpError(409, "Product slug already exists");
    }

    throw error;
  }
}
