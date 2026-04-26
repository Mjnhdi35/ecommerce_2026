import { Request, Response } from "express";
import { Controller } from "../../shared/http/controller";
import { createCategoryDto, updateCategoryDto } from "./category.dto";
import { CategoryService } from "./category.service";

export class CategoryController extends Controller {
  private categoryService: CategoryService;

  constructor({ categoryService }: { categoryService: CategoryService }) {
    super();
    this.categoryService = categoryService;
  }

  public getCategories = async (_req: Request, res: Response): Promise<void> => {
    const categories = await this.categoryService.findAll();

    this.ok(res, categories);
  };

  public getCategoryById = async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    const category = await this.categoryService.findById(
      this.requiredParam(req, "id", "Invalid category id"),
    );

    this.ok(res, category);
  };

  public getCategoryBySlug = async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    const category = await this.categoryService.findBySlug(
      this.requiredParam(req, "slug", "Invalid category slug"),
    );

    this.ok(res, category);
  };

  public createCategory = async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    const payload = createCategoryDto.parse(req.body);
    const category = await this.categoryService.create(payload);

    this.created(res, category);
  };

  public updateCategory = async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    const payload = updateCategoryDto.parse(req.body);
    const category = await this.categoryService.update(
      this.requiredParam(req, "id", "Invalid category id"),
      payload,
    );

    this.ok(res, category);
  };

  public archiveCategory = async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    await this.categoryService.archive(
      this.requiredParam(req, "id", "Invalid category id"),
    );

    this.noContent(res);
  };
}
