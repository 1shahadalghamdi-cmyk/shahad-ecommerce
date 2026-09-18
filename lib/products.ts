export type ProductSpecification = {
  label: string;
  value: string;
};

export type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  icon: string;

  /*
    Optional storefront metadata.

    These fields are optional so products created earlier
    from the Admin Dashboard continue to work without
    breaking existing localStorage data.
  */
  image?: string;
  description?: string;
  shortDescription?: string;
  specifications?: ProductSpecification[];
};

type ProductPresentation = Pick<
  Product,
  | "image"
  | "description"
  | "shortDescription"
  | "specifications"
>;

const productPresentationByName: Record<
  string,
  ProductPresentation
> = {
  "nova wireless headphones": {
    image: "/products/nova-headphones.png",
    shortDescription:
      "Premium wireless over-ear headphones designed for focused work, travel, and everyday listening.",
    description:
      "NOVA Wireless Headphones combine a clean over-ear design with comfortable cushioning, wireless connectivity, and an everyday sound profile built for work, entertainment, and travel.",
    specifications: [
      {
        label: "Connectivity",
        value: "Bluetooth Wireless",
      },
      {
        label: "Design",
        value: "Over-Ear",
      },
      {
        label: "Charging",
        value: "USB-C",
      },
      {
        label: "Microphone",
        value: "Built-in",
      },
      {
        label: "Use",
        value: "Work, Travel & Entertainment",
      },
    ],
  },

  "arc mechanical keyboard": {
    image: "/products/arc-keyboard.png",
    shortDescription:
      "Compact mechanical keyboard with a clean layout built for productive desktop setups.",
    description:
      "Arc Mechanical Keyboard brings a compact premium layout to modern workspaces, combining tactile typing, a space-efficient footprint, and a minimalist design for productivity and everyday use.",
    specifications: [
      {
        label: "Keyboard Type",
        value: "Mechanical",
      },
      {
        label: "Layout",
        value: "Compact",
      },
      {
        label: "Connectivity",
        value: "USB / Wireless Ready",
      },
      {
        label: "Key Profile",
        value: "Low-Profile",
      },
      {
        label: "Use",
        value: "Productivity & Everyday Typing",
      },
    ],
  },

  "flow wireless mouse": {
    image: "/products/flow-mouse.png",
    shortDescription:
      "Ergonomic wireless mouse designed for smooth navigation and everyday productivity.",
    description:
      "Flow Wireless Mouse is designed for comfortable daily use with a clean ergonomic shape, precise navigation, and convenient wireless connectivity for modern desk setups.",
    specifications: [
      {
        label: "Connectivity",
        value: "Wireless",
      },
      {
        label: "Tracking",
        value: "Precision Optical",
      },
      {
        label: "Design",
        value: "Ergonomic",
      },
      {
        label: "Controls",
        value: "Multi-Button",
      },
      {
        label: "Use",
        value: "Work & Everyday Productivity",
      },
    ],
  },

  "vision 27” monitor": {
    image: "/products/vision-monitor.png",
    shortDescription:
      "Minimal 27-inch display built for productive workspaces and clear everyday viewing.",
    description:
      "Vision 27” Monitor gives NOVA workspaces a clean large-format display with a minimal stand and modern design suited to productivity, dashboards, study, and everyday content.",
    specifications: [
      {
        label: "Display Size",
        value: "27-inch",
      },
      {
        label: "Panel",
        value: "LED Display",
      },
      {
        label: "Resolution",
        value: "High Definition",
      },
      {
        label: "Stand",
        value: "Desktop Stand",
      },
      {
        label: "Use",
        value: "Productivity & Content",
      },
    ],
  },

  'vision 27" monitor': {
    image: "/products/vision-monitor.png",
    shortDescription:
      "Minimal 27-inch display built for productive workspaces and clear everyday viewing.",
    description:
      "Vision 27” Monitor gives NOVA workspaces a clean large-format display with a minimal stand and modern design suited to productivity, dashboards, study, and everyday content.",
    specifications: [
      {
        label: "Display Size",
        value: "27-inch",
      },
      {
        label: "Panel",
        value: "LED Display",
      },
      {
        label: "Resolution",
        value: "High Definition",
      },
      {
        label: "Stand",
        value: "Desktop Stand",
      },
      {
        label: "Use",
        value: "Productivity & Content",
      },
    ],
  },

  "novabook pro 14": {
    image: "/products/novabook-pro.png",
    shortDescription:
      "Slim 14-inch performance laptop designed for work, study, and mobile productivity.",
    description:
      "NovaBook Pro 14 combines a portable aluminum-style design with a spacious display and modern performance profile for professionals, students, and users who need a capable everyday laptop.",
    specifications: [
      {
        label: "Display",
        value: "14-inch",
      },
      {
        label: "Form Factor",
        value: "Ultrabook",
      },
      {
        label: "Storage",
        value: "SSD",
      },
      {
        label: "Connectivity",
        value: "Wi-Fi & USB-C",
      },
      {
        label: "Use",
        value: "Work, Study & Mobility",
      },
    ],
  },

  "nova mini pc": {
    image: "/products/nova-mini-pc.png",
    shortDescription:
      "Compact desktop computer designed for clean workspaces and efficient everyday computing.",
    description:
      "NOVA Mini PC delivers desktop capability in a compact footprint, making it ideal for office desks, study spaces, digital workstations, and environments where space efficiency matters.",
    specifications: [
      {
        label: "Form Factor",
        value: "Mini Desktop",
      },
      {
        label: "Storage",
        value: "SSD",
      },
      {
        label: "Ports",
        value: "USB-C & USB",
      },
      {
        label: "Design",
        value: "Compact Aluminum-Style Chassis",
      },
      {
        label: "Use",
        value: "Office & Everyday Computing",
      },
    ],
  },

  "nova usb-c hub": {
    image: "/products/nova-usb-c-hub.png",
    shortDescription:
      "Compact connectivity hub for expanding USB-C devices with essential desktop ports.",
    description:
      "NOVA USB-C Hub expands laptop and workstation connectivity through a compact aluminum-style design with practical ports for displays, storage, accessories, and charging.",
    specifications: [
      {
        label: "Connection",
        value: "USB-C",
      },
      {
        label: "Ports",
        value: "HDMI, USB 3.0, USB-C PD, SD & TF",
      },
      {
        label: "Category",
        value: "Connectivity Accessory",
      },
      {
        label: "Design",
        value: "Compact Aluminum-Style Hub",
      },
      {
        label: "Use",
        value: "Laptop & Desktop Expansion",
      },
    ],
  },
};

export const defaultProducts: Product[] = [
  {
    id: 1,
    name: "Nova Wireless Headphones",
    category: "Audio",
    price: 549,
    stock: 24,
    icon: "🎧",
  },
  {
    id: 2,
    name: "Arc Mechanical Keyboard",
    category: "Accessories",
    price: 399,
    stock: 18,
    icon: "⌨️",
  },
  {
    id: 3,
    name: "Flow Wireless Mouse",
    category: "Accessories",
    price: 249,
    stock: 8,
    icon: "🖱️",
  },
  {
    id: 4,
    name: "Vision 27” Monitor",
    category: "Displays",
    price: 1299,
    stock: 4,
    icon: "🖥️",
  },
  {
    id: 5,
    name: "Nova USB-C Hub",
    category: "Accessories",
    price: 199,
    stock: 14,
    icon: "🔌",
  },
  {
    id: 6,
    name: "NovaBook Pro 14",
    category: "Computers",
    price: 4299,
    stock: 7,
    icon: "💻",
  },
  {
    id: 7,
    name: "NOVA Mini PC",
    category: "Computers",
    price: 2499,
    stock: 6,
    icon: "🖥️",
  },
].map(enrichProduct);

/*
  Keep this export so older parts of the project
  that import { products } continue to work.
*/
export const products = defaultProducts;

/*
  Adds professional presentation information to both
  default products and products that were previously
  created in the Admin Dashboard.

  This is important because your existing localStorage
  products may not yet contain image/description fields.
*/
export function enrichProduct(product: Product): Product {
  const key = product.name
    .trim()
    .toLowerCase();

  const presentation =
    productPresentationByName[key];

  if (!presentation) {
    return product;
  }

  return {
    ...product,
    image:
      product.image ??
      presentation.image,
    shortDescription:
      product.shortDescription ??
      presentation.shortDescription,
    description:
      product.description ??
      presentation.description,
    specifications:
      product.specifications ??
      presentation.specifications,
  };
}

export function getProductById(
  productId: number,
): Product | undefined {
  return getStoredProducts().find(
    (product) =>
      product.id === productId,
  );
}

export function getStoredProducts(): Product[] {
  if (typeof window === "undefined") {
    return defaultProducts;
  }

  const savedProducts =
    window.localStorage.getItem(
      "nova-admin-products",
    );

  if (!savedProducts) {
    return defaultProducts;
  }

  try {
    const parsedProducts =
      JSON.parse(savedProducts);

    if (!Array.isArray(parsedProducts)) {
      return defaultProducts;
    }

    const storedProducts =
      parsedProducts.map(
        (product) =>
          enrichProduct(product),
      );

    /*
      localStorage may contain an older catalog with
      fewer products. Keep those saved edits, then append
      any newer default products that are missing.
    */
    const storedIds =
      new Set(
        storedProducts.map(
          (product) =>
            product.id,
        ),
      );

    const missingDefaultProducts =
      defaultProducts.filter(
        (product) =>
          !storedIds.has(product.id),
      );

    return [
      ...storedProducts,
      ...missingDefaultProducts,
    ];
  } catch {
    return defaultProducts;
  }
}

