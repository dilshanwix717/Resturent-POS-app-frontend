import React from 'react';

const Bill = React.forwardRef(({ billNumber, cartItems, discount, subTotal, totalAmount, cashAmount, balance, walletAmount, walletBalance, paymentMethod, customer, date, time, serviceCharges }, ref) => {
  const username = localStorage.getItem('username');

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  const calculateSellingFinalPrice = (sellingPrice, sellingTypeCommission) => {
    if (sellingTypeCommission.endsWith('%')) {
      const percentage = parseFloat(sellingTypeCommission) / 100;
      return sellingTypeCommission.startsWith('-')
        ? sellingPrice - (sellingPrice * Math.abs(percentage))
        : sellingPrice + (sellingPrice * Math.abs(percentage));
    } else {
      const commissionValue = parseFloat(sellingTypeCommission);
      return sellingTypeCommission.startsWith('-')
        ? sellingPrice - Math.abs(commissionValue)
        : sellingPrice + Math.abs(commissionValue);
    }
  };

  const calculateDiscountAmount = (finalPrice, discount, discountDateRange) => {
    const [fromDate, toDate] = discountDateRange
      .replace('From:', '')
      .replace('to:', '')
      .split(' ')
      .map(date => new Date(date.trim()));

    const currentDate = new Date();

    if (currentDate < fromDate || currentDate > toDate) {
      return 0;
    }

    if (discount.endsWith('%')) {
      const percentage = parseFloat(discount) / 100;
      return finalPrice * percentage;
    } else {
      return parseFloat(discount);
    }
  };

  return (
    <div ref={ref} className="fixed inset-0 z-50 bg-white bg-opacity-50 flex flex-col justify-center items-center px-5 border-1">
      <div className='slider flex flex-col gap-1 w-96 h-auto bg-white overflow-auto'>
        <div className='flex justify-center'>
          <img src="/assets/logo.png" alt="logo" className='w-32' />
        </div>
        <h1 className='text-sm font-black text-center'>SALES RECEIPT</h1>
        <hr className='border-1 border-dashed border-black my-1' />
        <div className='grid grid-cols-12 gap-1 font-bold text-xs'>
          <p className='col-span-6'>Item</p>
          <p className='col-span-2 text-right'>Qt</p>
          <p className='col-span-4 text-right'>Price</p>
        </div>
        {cartItems.map((item, index) => (
          <div key={index} className='grid grid-cols-12 gap-1 text-xs'>
            <p className='col-span-6'>{item.name} ({item.size})</p>
            <p className="col-span-2 text-right">{item.quantity}x</p>
            <p className="col-span-4 text-right">{formatPrice(calculateSellingFinalPrice(item.sellingPrice, item.sellingTypeCommission) - formatPrice(calculateDiscountAmount(calculateSellingFinalPrice(item.sellingPrice, item.sellingTypeCommission), item.discount, item.discountDateRange)))}</p>
          </div>
        ))}
        <p className='text-center font-bold text-xs'>
          {cartItems.reduce((total, item) => total + item.quantity, 0)}x Items Sold
        </p>
        <hr className='border-1 border-dashed border-black my-1' />
        <div className='flex font-bold justify-between text-xs'>
          <p>Sub Total :</p>
          <p>LKR {subTotal}</p>
        </div>
        <div className='flex font-bold justify-between text-xs'>
          <p>Discount Total :</p>
          <p>LKR {formatPrice(discount)}</p>
        </div>
        <div className='flex font-bold justify-between text-xs'>
          <p>Service Charges :</p>
          <p> {
            String(serviceCharges).endsWith('%') ?
              serviceCharges :
              'LKR ' + formatPrice(parseFloat(serviceCharges))
          }</p>
        </div>
        <hr className='border-1 border-dashed border-black my-1' />
        <div className='flex font-bold justify-between text-xs'>
          <p>Total :</p>
          <p>LKR {totalAmount}</p>
        </div>
        {paymentMethod === 'Cash' && (
          <>
            <div className='flex font-bold justify-between text-xs'>
              <p>Cash</p>
              <p>LKR {formatPrice(cashAmount)}</p>
            </div>
            <div className='flex font-bold justify-between text-xs'>
              <p>Balance :</p>
              <p>LKR {formatPrice(balance)}</p>
            </div>
          </>
        )}
        {paymentMethod === 'Wallet' && (
          <>
            <div className='flex font-bold justify-between text-xs'>
              <p>Wallet</p>
              <p>LKR {formatPrice(walletAmount)}</p>
            </div>
            <div className='flex font-bold justify-between text-xs'>
              <p>Balance :</p>
              <p>LKR {formatPrice(walletBalance)}</p>
            </div>
          </>
        )}

        <hr className='border-1 border-dashed border-black my-1' />
        <h1 className='font-black text-center text-sm'>THANK YOU.!</h1>
        <hr className='border-1 border-dashed border-black my-1' />
        <div className='flex font-bold justify-between text-sm'>
          <p>{billNumber}</p>
          <p>{date}</p>
          <p>{time}</p>
          <p>{username}</p>
        </div>
        <hr className='border-1 border-dashed border-black my-1' />
        <p className='text-center text-sm'>Powered by CeylonX</p>
      </div>
    </div>
  );
});

export default Bill;
