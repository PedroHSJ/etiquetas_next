import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApiErrorResponse, ApiSuccessResponse } from "@/types/common/api";
import { ProductGroup } from "@/types/stock/product";

interface ProductWithStock {
  id: number;
  name: string;
  groupId?: number | null;
  group?: ProductGroup | null;
  currentQuantity: number;
  unitOfMeasureCode: string;
}

// Endpoint to list products with stock metadata for quick entry dialog
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      const errorResponse: ApiErrorResponse = {
        error: "Unauthorized",
      };
      return NextResponse.json(errorResponse, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get("q") || "";
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const organizationId = searchParams.get("organizationId");
    const onlyWithStock =
      searchParams.get("onlyWithStock") === "true" ? true : false;

    // Fetch products with optional name filter
    const whereProducts: any = {};
    if (searchTerm) {
      whereProducts.name = {
        contains: searchTerm,
        mode: "insensitive",
      };
    }

    const products = await prisma.products.findMany({
      where: whereProducts,
      include: {
        groups: true,
      },
      orderBy: {
        name: "asc",
      },
      take: limit,
    });

    // Fetch stock for these products and organization
    const productIds = products.map((p: any) => p.id);
    const whereStock: any = {
      productId: { in: productIds },
    };
    if (organizationId) {
      whereStock.organizationId = organizationId;
    }
    if (onlyWithStock) {
      whereStock.currentQuantity = { gt: 0 };
    }

    const stockItems = await prisma.stock.findMany({
      where: whereStock,
      select: {
        productId: true,
        currentQuantity: true,
        unitOfMeasureCode: true,
      },
    });

    const stockMap = stockItems.reduce((acc: any, item: any) => {
      acc[item.productId] = item;
      return acc;
    }, {});

    const productsWithStock: ProductWithStock[] = [];

    for (const product of products) {
      const stockInfo = stockMap[product.id];
      const quantity = stockInfo?.currentQuantity
        ? Number(stockInfo.currentQuantity)
        : 0;

      if (onlyWithStock && quantity <= 0) {
        continue;
      }

      const unit = stockInfo?.unitOfMeasureCode || "un";

      productsWithStock.push({
        id: product.id,
        name: product.name,
        groupId: product.groupId,
        group: product.groups as unknown as ProductGroup,
        unitOfMeasureCode: unit,
        currentQuantity: quantity,
      });
    }

    const successResponse: ApiSuccessResponse<ProductWithStock[]> = {
      data: productsWithStock,
    };

    return NextResponse.json(successResponse, { status: 200 });
  } catch (error) {
    console.error("Error on /api/estoque/produtos route:", error);
    const errorResponse: ApiErrorResponse = {
      error: "Internal error while fetching products",
      details: error instanceof Error ? { message: error.message } : undefined,
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
