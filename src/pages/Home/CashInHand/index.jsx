import React from 'react';

const CashInHand = () => {
  return (
    <div className='slider h-screen-100px flex px-5 flex-col w-full overflow-auto'>
      <p className='text-base font-bold py-2'>Cash In Hand</p>
      <div className='flex flex-col gap-5'>
        <div className='rounded-lg flex bg-cover w-fit' style={{ backgroundImage: 'url(/assets/img/card-background.svg)'}}>
          <div className='py-10 px-16'>
            <img src="/assets/img/profile.svg" alt="Profile" className='w-20 h-20 rounded-lg' />
          </div>
          <div className='bg-primary flex flex-col gap-3 text-xs xl:text-sm font-medium rounded-lg p-5'>
            <p className='text-white font-bold'>CASHIER</p>
            <div className='bg-white p-2 rounded-lg'>
             <p className='text-black font-bold'>SALE</p>
             <p className='text-xs xl:text-sm'>LKR 28340.99</p>
            </div>
            <p>CASH - 28340.99</p>
            <p>CARD - 00.00</p>
            <p>WALLET - 00.00</p>
            <p>LOYALTY - 00.00</p>
            <div>
              <div className='grid grid-cols-2 gap-2'>
                <p className='bg-white text-black p-2 rounded-lg'>Start Balance : +LKR 1.00</p>
                <p className='bg-white text-black p-2 rounded-lg'>Expenses : +LKR 1.00</p>
                <p className='bg-white text-black p-2 rounded-lg'>Cash Sale : +LKR 1.00</p>
                <p className='bg-red-400 text-tColor p-2 rounded-lg'>Cash Sale : +LKR 1.00</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CashInHand;
