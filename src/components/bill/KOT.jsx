import React from 'react';

const KOT = React.forwardRef(({ billNumber, cartItems, time }, ref) => {
  return (
    <div ref={ref} className="fixed inset-0 z-50 bg-white bg-opacity-50 flex flex-col justify-center items-center px-5 border-1">
      <div className='slider flex flex-col gap-1 w-96 h-auto bg-white text-xs'>
        {/*<img src="/assets/logo.png" alt="logo" className='w-full' />*/}
        <h1 className='font-black text-center uppercase text-lg'>Kitchen Order Ticket</h1>
        <hr className='border-1 border-dashed border-black my-1' />
        <div className='flex justify-between text-lg'>
          <div className='flex gap-1'>
            <p>Date : </p>
            <p>{new Date().toLocaleDateString()}</p>
          </div>
          <div className='flex gap-1'>
            <p>Time : </p>
            <p>{time}</p>
          </div>
        </div>
        <div className='flex justify-between text-lg'>
          <p>Order : </p>
          <p>{billNumber}</p>
        </div>
        <table className="w-full border-collapse my-1 text-lg">
          {/* Hot Kitchen Section */}
          {cartItems?.some(item => item.deviceLocation === 'Hot Kitchen') && (
            <>
              <thead>
                <tr>
                  <th className="text-left">Hot Kitchen Item</th>
                  <th className="text-right">Qty</th>
                </tr>
              </thead>
              <tbody>
                {cartItems
                  .filter(item => item.deviceLocation === 'Hot Kitchen')
                  .map((item, index) => (
                    <tr key={`hot-${index}`}>
                      <td>{`${item.name} (${item.size})`}</td>
                      <td className="text-right">{`${item.quantity}x`}</td>
                    </tr>
                  ))}
              </tbody>
            </>
          )}

          {/* Dividing Line */}
          {cartItems?.some(item => item.deviceLocation === 'Hot Kitchen') &&
          cartItems?.some(item => item.deviceLocation === 'Cold Kitchen') && (
            <thead>
              <tr>
                <th colSpan="2">
                  <hr className="border-1 w-full border-dashed border-black my-1" />
                </th>
              </tr>
            </thead>
          )}

          {/* Cold Kitchen Section */}
          {cartItems?.some(item => item.deviceLocation === 'Cold Kitchen') && (
            <>
              <thead>
                <tr>
                  <th className="text-left">Cold Kitchen Item</th>
                  <th className="text-right">Qty</th>
                </tr>
              </thead>
              <tbody>
                {cartItems
                  .filter(item => item.deviceLocation === 'Cold Kitchen')
                  .map((item, index) => (
                    <tr key={`cold-${index}`}>
                      <td>{`${item.name} (${item.size})`}</td>
                      <td className="text-right">{`${item.quantity}x`}</td>
                    </tr>
                  ))}
              </tbody>
            </>
          )}

            <thead>
              <tr>
                <th colSpan="2">
                  <hr className="border-1 w-full border-dashed border-black my-1" />
                </th>
              </tr>
            </thead>

          {/* Total Items */}
          <thead>
            <tr>
              <th className="text-left">Total Items :</th>
              <th className="text-right">
                {cartItems?.reduce((acc, item) => acc + item.quantity, 0)}
              </th>
            </tr>
          </thead>
        </table>

        <hr className='border-1 border-dashed border-black my-1' />
      </div>
    </div>
  );
});

export default KOT;
