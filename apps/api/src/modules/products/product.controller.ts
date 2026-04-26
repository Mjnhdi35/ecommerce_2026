import { Request, Response } from "express";
import { Controller } from "../../shared/http/controller";
import {
  createProductDto,
  productQueryDto,
  updateProductDto,
} from "./product.dto";
import { ProductService } from "./product.service";

export class ProductController extends Controller {
  private productService: ProductService;

  constructor({ productService }: { productService: ProductService }) {
    super();
    this.productService = productService;
  }

  public getProducts = async (req: Request, res: Response): Promise<void> => {
    const query = productQueryDto.parse(req.query);
    const products = await this.productService.findAll(query);

    this.ok(res, products);
  };

  public getProductById = async (req: Request, res: Response): Promise<void> => {
    const product = await this.productService.findById(
      this.requiredParam(req, "id", "Invalid product id"),
    );

    this.ok(res, product);
  };

  public getProductBySlug = async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    const product = await this.productService.findBySlug(
      this.requiredParam(req, "slug", "Invalid product slug"),
    );

    this.ok(res, product);
  };

  public createProduct = async (req: Request, res: Response): Promise<void> => {
    const payload = createProductDto.parse(req.body);
    const product = await this.productService.create(payload);

    this.created(res, product);
  };

  public updateProduct = async (req: Request, res: Response): Promise<void> => {
    const payload = updateProductDto.parse(req.body);
    const product = await this.productService.update(
      this.requiredParam(req, "id", "Invalid product id"),
      payload,
    );

    this.ok(res, product);
  };

  public deleteProduct = async (req: Request, res: Response): Promise<void> => {
    await this.productService.delete(
      this.requiredParam(req, "id", "Invalid product id"),
    );

    this.noContent(res);
  };
}
