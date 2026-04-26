import { Request, Response } from "express";
import { z } from "zod";
import { HttpError } from "../../shared/errors/http-error";
import { ApiResponse } from "../../shared/http/response";
import {
  createProductDto,
  productQueryDto,
  updateProductDto,
} from "./product.dto";
import { ProductService } from "./product.service";

export class ProductController {
  private productService: ProductService;

  constructor({ productService }: { productService: ProductService }) {
    this.productService = productService;
  }

  public getProducts = async (req: Request, res: Response): Promise<void> => {
    const query = productQueryDto.parse(req.query);
    const products = await this.productService.findAll(query);

    ApiResponse.success(res, products);
  };

  public getProductById = async (req: Request, res: Response): Promise<void> => {
    const product = await this.productService.findById(this.getIdParam(req));

    ApiResponse.success(res, product);
  };

  public getProductBySlug = async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    const { slug } = req.params;

    if (typeof slug !== "string") {
      throw new HttpError(400, "Invalid product slug");
    }

    const product = await this.productService.findBySlug(slug);

    ApiResponse.success(res, product);
  };

  public createProduct = async (req: Request, res: Response): Promise<void> => {
    const payload = createProductDto.parse(req.body);
    const product = await this.productService.create(payload);

    ApiResponse.success(res, product, 201);
  };

  public updateProduct = async (req: Request, res: Response): Promise<void> => {
    const payload = updateProductDto.parse(req.body);
    const product = await this.productService.update(this.getIdParam(req), payload);

    ApiResponse.success(res, product);
  };

  public deleteProduct = async (req: Request, res: Response): Promise<void> => {
    await this.productService.delete(this.getIdParam(req));

    ApiResponse.noContent(res);
  };

  public handleError = (error: unknown, res: Response): void => {
    if (error instanceof z.ZodError) {
      ApiResponse.error(res, "Invalid request", 400, error.issues);
      return;
    }

    if (error instanceof HttpError) {
      ApiResponse.error(res, error.message, error.statusCode);
      return;
    }

    throw error;
  };

  private getIdParam(req: Request): string {
    const { id } = req.params;

    if (typeof id !== "string") {
      throw new HttpError(400, "Invalid product id");
    }

    return id;
  }
}
