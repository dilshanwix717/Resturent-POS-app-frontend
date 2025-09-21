export const formatPrice = (price) => {
    return price.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
  };
  