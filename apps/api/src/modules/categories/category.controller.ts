import { Request, Response } from "express";
import { HttpError } from "../../shared/errors/http-error";
import { ApiResponse } from "../../shared/http/response";
import { createCategoryDto, updateCategoryDto } from "./category.dto";
import { CategoryService } from "./category.service";

export class CategoryController {
  private categoryService: CategoryService;

  constructor({ categoryService }: { categoryService: CategoryService }) {
    this.categoryService = categoryService;
  }

  public getCategories = async (_req: Request, res: Response): Promise<void> => {
    const categories = await this.categoryService.findAll();

    ApiResponse.success(res, categories);
  };

  public getCategoryById = async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    const category = await this.categoryService.findById(this.getIdParam(req));

    ApiResponse.success(res, category);
  };

  public getCategoryBySlug = async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    const { slug } = req.params;

    if (typeof slug !== "string") {
      throw new HttpError(400, "Invalid category slug");
    }

    const category = await this.categoryService.findBySlug(slug);

    ApiResponse.success(res, category);
  };

  public createCategory = async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    const payload = createCategoryDto.parse(req.body);
    const category = await this.categoryService.create(payload);

    ApiResponse.success(res, category, 201);
  };

  public updateCategory = async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    const payload = updateCategoryDto.parse(req.body);
    const category = await this.categoryService.update(
      this.getIdParam(req),
      payload,
    );

    ApiResponse.success(res, category);
  };

  public archiveCategory = async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    await this.categoryService.archive(this.getIdParam(req));

    ApiResponse.noContent(res);
  };

  private getIdParam(req: Request): string {
    const { id } = req.params;

    if (typeof id !== "string") {
      throw new HttpError(400, "Invalid category id");
    }

    return id;
  }
}
