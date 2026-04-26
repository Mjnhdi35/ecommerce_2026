import {
  Filter,
  MongoServerError,
  ObjectId,
  OptionalId,
  WithId,
} from "mongodb";
import { HttpError } from "../../shared/errors/http-error";
import { Product, ProductStatus } from "./product.model";
import { ProductRepository } from "./product.repository";

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
  private productRepository: ProductRepository;

  constructor({
    productRepository,
  }: {
    productRepository: ProductRepository;
  }) {
    this.productRepository = productRepository;
  }

  public async findAll(query: ProductQuery = {}): Promise<PaginatedProducts> {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const filter = this.buildFilter(query);
    const { items, total } = await this.productRepository.findAll({
      filter,
      limit,
      page,
    });

    return {
      items,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  public async findById(id: string): Promise<WithId<Product>> {
    const product = await this.productRepository.findById(this.toObjectId(id));

    if (!product) {
      throw new HttpError(404, "Product not found");
    }

    return product;
  }

  public async findBySlug(slug: string): Promise<WithId<Product>> {
    const product = await this.productRepository.findBySlug(slug);

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
      const insertedId = await this.productRepository.insert(document);
      return this.findById(insertedId.toHexString());
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
      const result = await this.productRepository.update(
        this.toObjectId(id),
        update,
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
    const result = await this.productRepository.delete(this.toObjectId(id));

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
      .replace(/đ/g, "d")
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
