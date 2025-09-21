import React, { useEffect, useState } from "react";

const ProductGrid = ({ groupedProducts, onAddToCart }) => {
  useEffect(() => {
    console.log(groupedProducts);
  }, [groupedProducts])

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const getSizeAbbreviation = (size) => {
    switch (size.toLowerCase()) {
      case "regular":
        return "R";
      case "medium":
        return "R";
      case "large":
        return "L";
      case "small":
        return "S";
      default:
        return size;
    }
  };

  const calculateFinalPrice = (price, commission) => {
    const parsedCommission = parseFloat(commission || "0");
    return price + parsedCommission;
  };

  const applyDiscount = (price, discount, discountDateRange) => {
    if (!discount || !discountDateRange) return price;

    const [from, to] = discountDateRange
      .replace("From:", "")
      .replace("to:", "")
      .split(" ")
      .map((date) => new Date(date.trim()));

    const currentDate = new Date();

    if (currentDate >= from && currentDate <= to) {
      if (discount.endsWith("%")) {
        const discountPercentage = parseFloat(discount.replace("%", ""));
        return price - (price * discountPercentage) / 100;
      } else if (!isNaN(parseFloat(discount))) {
        const discountAmount = parseFloat(discount);
        return price - discountAmount;
      }
    }

    return price;
  };

  // Track selected size for each product
  const [selectedSizes, setSelectedSizes] = useState({});

  const handleSizeClick = (productName, size) => {
    const productVariants = groupedProducts[productName];
    const selectedProduct = productVariants.find(
      (variant) => variant.size === size
    );

    if (selectedProduct) {
      const finalPrice = calculateFinalPrice(
        selectedProduct.sellingPrice,
        selectedProduct.sellingTypeCommission
      );

      const discountedPrice = applyDiscount(
        finalPrice,
        selectedProduct.discount,
        selectedProduct.discountDateRange
      );

      onAddToCart({
        ...selectedProduct,
        name: productName,
        size,
        price: discountedPrice,
        finalPrice: discountedPrice,
      });
    }
  };

  const handleSizeChange = (productName, size) => {
    setSelectedSizes((prev) => ({ ...prev, [productName]: size }));
    handleSizeClick(productName, size);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 text-xs xl:text-sm slider overflow-auto">
      {Object.keys(groupedProducts || {}).map((productName) => {
        const productVariants = groupedProducts[productName] || [];
        if (!productVariants.length) {
          return <p key={productName}>No variants available for {productName}</p>;
        }

        const selectedSize = selectedSizes[productName] || productVariants[0].size;
        const selectedProduct = productVariants.find(
          (product) => product.size === selectedSize
        );

        if (!selectedProduct || selectedProduct.sellingPrice === undefined) {
          return (
            <p key={productName}>Error: Product data is missing or incomplete.</p>
          );
        }

        const finalPrice = calculateFinalPrice(
          selectedProduct.sellingPrice,
          selectedProduct.sellingTypeCommission
        );

        const discountedPrice = applyDiscount(
          finalPrice,
          selectedProduct.discount,
          selectedProduct.discountDateRange
        );

        const discountDisplay =
          discountedPrice < finalPrice
            ? `${formatPrice(finalPrice - discountedPrice)}`
            : null;

        return (
          <div
            key={productName}
            className="flex flex-col gap-1 justify-between relative items-center p-2 bg-white border-2 hover:border-secondary rounded-lg text-center cursor-pointer"
          >
            <p className="font-bold pt-5">{productName}</p>

            <p className="font-bold">
              {discountDisplay ? (
                <span className="flex flex-col">
                  <span className=" text-base">{formatPrice(discountedPrice)}</span>
                  <span className="line-through text-gray-500">
                    {formatPrice(finalPrice)}
                  </span>
                </span>
              ) : (
                formatPrice(finalPrice)
              )}
            </p>

            <div className="flex gap-2">
              {productVariants.map((variant) => (
                <button
                  key={variant.size}
                  onClick={() => handleSizeChange(productName, variant.size)}
                  className={`px-2 py-1 rounded-lg border ${selectedSize === variant.size
                    ? "bg-secondary text-white"
                    : "bg-gray-200"
                    }`}
                >
                  {getSizeAbbreviation(variant.size)}
                </button>
              ))}
            </div>

            {discountDisplay && (
              <p className="absolute top-1 right-1 bg-merunRed text-white p-1 rounded-full font-semibold">
                {selectedProduct.discount}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ProductGrid;
