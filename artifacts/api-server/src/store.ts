import { randomUUID } from "node:crypto";

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export type PaymentMethod = "CASH_ON_DELIVERY" | "BKASH_MANUAL";

export type Product = {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  marketPrice: number | null;
  stock: number;
  images: string[];
  category: string;
  itemsIncluded: string[];
  isActive: boolean;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
};

export type OrderItem = {
  id: string;
  productId: string;
  title: string;
  quantity: number;
  price: number;
  image: string | null;
};

export type Order = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  customerName: string;
  customerPhone: string;
  university: string | null;
  deliveryAddress: string;
  trxId: string | null;
  items: OrderItem[];
  summary: {
    subtotal: number;
    deliveryFee: number;
    total: number;
  };
  createdAt: string;
  updatedAt: string;
};

const image = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=85`;

const timestamp = () => new Date().toISOString();

const productSeed: Omit<Product, "createdAt" | "updatedAt">[] = [
  {
    id: "p-starter",
    title: "Freshman Starter Kit",
    slug: "freshman-starter-kit",
    description:
      "A thoughtful first-semester bundle with the everyday essentials you need for lectures, deadlines, and late-night study sessions.",
    price: 499,
    marketPrice: 650,
    stock: 24,
    images: [image("photo-1531346878377-a5be20888e57")],
    category: "Bundles",
    itemsIncluded: ["3 premium notebooks", "Gel pen set", "Sticky notes", "Weekly planner"],
    isActive: true,
    featured: true,
  },
  {
    id: "p-notebooks",
    title: "Campus Essentials Notebook Set",
    slug: "campus-notebook-set",
    description:
      "Three premium ruled notebooks with sturdy covers and smooth 80 GSM pages that feel good in every lecture.",
    price: 299,
    marketPrice: 360,
    stock: 48,
    images: [image("photo-1517842645767-c639042777db")],
    category: "Notebooks",
    itemsIncluded: ["3 ruled notebooks", "80 GSM paper", "Durable covers"],
    isActive: true,
    featured: true,
  },
  {
    id: "p-focus",
    title: "Study Focus Stationery Box",
    slug: "study-focus-box",
    description:
      "A colourful desk refresh curated for focused study, tidy notes, and a little more joy between assignments.",
    price: 799,
    marketPrice: 950,
    stock: 12,
    images: [image("photo-1456324504439-367cee3b3c32")],
    category: "Bundles",
    itemsIncluded: ["Notebook", "Highlighters", "Desk organiser", "Pen pouch"],
    isActive: true,
    featured: true,
  },
  {
    id: "p-gel",
    title: "Smooth Gel Pen Pack",
    slug: "smooth-gel-pen-pack",
    description:
      "Six quick-drying gel pens with comfortable grips for long lecture notes, sketches, and exam prep.",
    price: 149,
    marketPrice: 180,
    stock: 72,
    images: [image("photo-1585336261022-680e295ce3fe")],
    category: "Writing",
    itemsIncluded: ["6 gel pens", "Black, blue and colour ink"],
    isActive: true,
    featured: false,
  },
  {
    id: "p-planner",
    title: "Weekly Academic Planner",
    slug: "weekly-academic-planner",
    description:
      "An undated weekly planner for classes, deadlines, goals, and the small tasks that keep a semester moving.",
    price: 249,
    marketPrice: 300,
    stock: 31,
    images: [image("photo-1506784983877-45594efa4cbe")],
    category: "Planners",
    itemsIncluded: ["Undated weekly spreads", "Goal pages", "Notes pages"],
    isActive: true,
    featured: false,
  },
  {
    id: "p-pastel",
    title: "Pastel Highlighter Set",
    slug: "pastel-highlighter-set",
    description:
      "Six soft pastel colours that make revision notes easier to scan without shouting over your handwriting.",
    price: 199,
    marketPrice: 240,
    stock: 40,
    images: [image("photo-1588072432836-e10032774350")],
    category: "Writing",
    itemsIncluded: ["6 pastel highlighters", "Chisel tips"],
    isActive: true,
    featured: false,
  },
];

const products: Product[] = productSeed.map((product) => ({
  ...product,
  createdAt: timestamp(),
  updatedAt: timestamp(),
}));

const orders: Order[] = [];
let orderSequence = 10001;

export function listProducts(options: {
  category?: string;
  featured?: boolean;
  search?: string;
  includeInactive?: boolean;
} = {}): Product[] {
  const search = options.search?.trim().toLowerCase();
  return products.filter((product) => {
    if (!options.includeInactive && !product.isActive) return false;
    if (options.category && product.category.toLowerCase() !== options.category.toLowerCase()) {
      return false;
    }
    if (options.featured !== undefined && product.featured !== options.featured) return false;
    if (
      search &&
      !`${product.title} ${product.description} ${product.category}`
        .toLowerCase()
        .includes(search)
    ) {
      return false;
    }
    return true;
  });
}

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((product) => product.slug === slug && product.isActive);
}

export function getProductById(id: string): Product | undefined {
  return products.find((product) => product.id === id);
}

export function createProduct(input: Omit<Product, "id" | "createdAt" | "updatedAt">): Product {
  const now = timestamp();
  const product: Product = { ...input, id: randomUUID(), createdAt: now, updatedAt: now };
  products.unshift(product);
  return product;
}

export function updateProduct(
  id: string,
  input: Partial<Omit<Product, "id" | "createdAt" | "updatedAt">>,
): Product | undefined {
  const product = getProductById(id);
  if (!product) return undefined;
  Object.assign(product, input, { updatedAt: timestamp() });
  return product;
}

export function archiveProduct(id: string): Product | undefined {
  return updateProduct(id, { isActive: false });
}

export function listOrders(options: {
  status?: OrderStatus;
  search?: string;
  limit?: number;
} = {}): Order[] {
  const search = options.search?.trim().toLowerCase();
  return orders
    .filter((order) => {
      if (options.status && order.status !== options.status) return false;
      if (
        search &&
        !`${order.orderNumber} ${order.customerName} ${order.customerPhone} ${order.university ?? ""}`
          .toLowerCase()
          .includes(search)
      ) {
        return false;
      }
      return true;
    })
    .slice(0, options.limit ?? 50);
}

export function getOrderByNumber(orderNumber: string): Order | undefined {
  return orders.find((order) => order.orderNumber === orderNumber);
}

export function getOrderById(id: string): Order | undefined {
  return orders.find((order) => order.id === id);
}

export function createOrder(input: {
  customerName: string;
  customerPhone: string;
  university?: string | null;
  deliveryAddress: string;
  paymentMethod: PaymentMethod;
  trxId?: string | null;
  items: Array<{ productId: string; quantity: number }>;
}): { order?: Order; error?: { code: string; message: string } } {
  const requested = new Map<string, number>();
  for (const item of input.items) {
    requested.set(item.productId, (requested.get(item.productId) ?? 0) + item.quantity);
  }

  const hydrated: OrderItem[] = [];
  for (const [productId, quantity] of requested) {
    const product = getProductById(productId);
    if (!product || !product.isActive) {
      return { error: { code: "PRODUCT_NOT_FOUND", message: "One of the selected products is no longer available." } };
    }
    if (quantity > product.stock) {
      return { error: { code: "INSUFFICIENT_STOCK", message: `${product.title} has only ${product.stock} left.` } };
    }
    hydrated.push({
      id: randomUUID(),
      productId: product.id,
      title: product.title,
      quantity,
      price: product.price,
      image: product.images[0] ?? null,
    });
  }

  if (input.paymentMethod === "BKASH_MANUAL" && !input.trxId?.trim()) {
    return { error: { code: "TRX_ID_REQUIRED", message: "A bKash transaction ID is required." } };
  }

  const subtotal = hydrated.reduce((total, item) => total + item.price * item.quantity, 0);
  const deliveryFee = subtotal >= 1000 ? 0 : 60;
  for (const item of hydrated) {
    const product = getProductById(item.productId);
    if (product) product.stock -= item.quantity;
  }

  const now = timestamp();
  const order: Order = {
    id: randomUUID(),
    orderNumber: `UH-${orderSequence++}`,
    status: "PENDING",
    paymentMethod: input.paymentMethod,
    customerName: input.customerName.trim(),
    customerPhone: input.customerPhone.trim(),
    university: input.university?.trim() || null,
    deliveryAddress: input.deliveryAddress.trim(),
    trxId: input.trxId?.trim() || null,
    items: hydrated,
    summary: { subtotal, deliveryFee, total: subtotal + deliveryFee },
    createdAt: now,
    updatedAt: now,
  };
  orders.unshift(order);
  return { order };
}

export function updateOrderStatus(id: string, status: OrderStatus): Order | undefined {
  const order = getOrderById(id);
  if (!order) return undefined;
  if (order.status !== "CANCELLED" && status === "CANCELLED") {
    for (const item of order.items) {
      const product = getProductById(item.productId);
      if (product) product.stock += item.quantity;
    }
  }
  order.status = status;
  order.updatedAt = timestamp();
  return order;
}

export function listCustomers(search?: string) {
  const byPhone = new Map<
    string,
    {
      id: string;
      name: string;
      phone: string;
      university: string | null;
      orderCount: number;
      totalSpending: number;
      lastOrderAt: string | null;
    }
  >();
  for (const order of orders) {
    const current = byPhone.get(order.customerPhone) ?? {
      id: randomUUID(),
      name: order.customerName,
      phone: order.customerPhone,
      university: order.university,
      orderCount: 0,
      totalSpending: 0,
      lastOrderAt: null,
    };
    current.orderCount += 1;
    if (order.status !== "CANCELLED") current.totalSpending += order.summary.total;
    current.lastOrderAt = order.createdAt;
    byPhone.set(order.customerPhone, current);
  }
  const query = search?.trim().toLowerCase();
  return Array.from(byPhone.values()).filter((customer) =>
    query
      ? `${customer.name} ${customer.phone} ${customer.university ?? ""}`.toLowerCase().includes(query)
      : true,
  );
}

export function dashboard() {
  const today = new Date().toISOString().slice(0, 10);
  const todayOrders = orders.filter((order) => order.createdAt.startsWith(today));
  return {
    todayOrders: todayOrders.length,
    pendingOrders: orders.filter((order) => order.status === "PENDING").length,
    processingOrders: orders.filter((order) => ["CONFIRMED", "PROCESSING"].includes(order.status)).length,
    deliveredOrders: orders.filter((order) => order.status === "DELIVERED").length,
    todaySales: todayOrders
      .filter((order) => order.status !== "CANCELLED")
      .reduce((total, order) => total + order.summary.total, 0),
    totalProducts: products.filter((product) => product.isActive).length,
    lowStockProducts: products.filter((product) => product.isActive && product.stock <= 10).length,
    recentOrders: orders.slice(0, 8),
  };
}