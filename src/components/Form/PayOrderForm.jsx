import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';
import { MainButton } from '../Button/Button';
import { useNavigate } from 'react-router-dom';
import { IoMdCloseCircle } from 'react-icons/io';
import { fetchSellingTypes, createOrder } from '../../api/apiService';
import CustomerRegisterForm from '../../components/Form/CustomerRegisterForm';
import KOT from '../bill/KOT';
import Bill from '../bill/Bill';
import ReactToPrint from 'react-to-print';

const PayOrderForm = ({ totalAmount, discount, subTotal, cartItems, sellingTypeId, onClose, onPayOrder, serviceCharges, billNumber }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [customerID, setCustomerID] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [cashPaid, setCashPaid] = useState("");
  const [cardNumber, setCardNumber] = useState('');
  const [sellingType, setSellingType] = useState(null);
  const companyId = localStorage.getItem('companyId');
  const userId = localStorage.getItem('userId');
  const shopId = localStorage.getItem('shopId');
  const navigate = useNavigate();
  const KOTComponentRef = useRef(null);
  const BillComponentRef = useRef(null);

  const calculateBalance = () => {
    const total = parseFloat(totalAmount.replace(/,/g, '')) || 0;
    const cash = cashPaid ? parseFloat(cashPaid) || 0 : 0;
    return cash - total;
  };

  useEffect(() => {
    const initializeSellingTypes = async () => {
      try {
        const sellingTypes = await fetchSellingTypes();
        const selectedSellingType = sellingTypes.find(item => item.sellingTypeId === sellingTypeId);

        if (selectedSellingType) {
          setSellingType(selectedSellingType.sellingType);
        } else {
          console.error('Selling type not found for the given ID');
        }
      } catch (error) {
        console.error('Error fetching selling types:', error);
      }
    };

    initializeSellingTypes();
  }, [sellingTypeId]);

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

  const calculateDiscountAmount = (finalPrice, discount) => {
    if (discount.endsWith('%')) {
      const percentage = parseFloat(discount) / 100;
      return finalPrice * percentage;
    } else {
      return parseFloat(discount);
    }
  };

  const handlePayOrder = async () => {
    const parsedTotalAmount = parseFloat(totalAmount.replace(/,/g, '')) || 0;
    const parsedCashPaid = parseFloat(cashPaid) || 0;

    if (!customerID || customerID.trim() === '') {
      toast.error('Please select a customer.');
      return;
    }

    if (paymentMethod === 'Cash' && parsedCashPaid < parsedTotalAmount) {
      toast.error('Cash paid is less than the total amount.');
      return;
    }

    const items = cartItems.map(item => {
      const sellingFinalPrice = calculateSellingFinalPrice(item.sellingPrice, item.sellingTypeCommission);
      const discountAmount = calculateDiscountAmount(sellingFinalPrice, item.discount) + (item.customDiscount || 0);

      return {
        productId: item.productId,
        sellingPrice: sellingFinalPrice,
        discountAmount: discountAmount,
        quantity: item.quantity,
      };
    });

    const orderData = {
      companyId: companyId,
      shopId: shopId,
      userId: userId,
      order: {
        invoiceID: `INV-${billNumber}`,
        billTotal: parsedTotalAmount,
        cashAmount: paymentMethod === 'Cash' ? parsedCashPaid : 0,
        cardAmount: paymentMethod === 'Card' ? parsedTotalAmount : 0,
        cardDigits: paymentMethod === 'Card' ? cardNumber : '',
        walletIn: 0,
        walletOut: 0,
        otherPayment: 0,
        loyaltyPoints: 0,
        customerId: customerID,
        sellingTypeID: sellingTypeId,
        sellingType: sellingType,
        sellingTypeCharge: serviceCharges,
        sellingTypeAmount: 0,
        items: items,
      },
    };

    console.log('Order Data:', JSON.stringify(orderData, null, 2));

    try {
      const response = await createOrder(orderData);
      console.log('Order created successfully:', response);
      toast.success('Order completed successfully!');
      onPayOrder(parsedCashPaid);
      onClose();
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Error completing order.');
    }
  };

  const formatPrice = (price) => new Intl.NumberFormat("en-US", {
    style: "decimal",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);

  const getCurrentDateTime = () => {
    const now = new Date();
    const date = now.toLocaleDateString('en-GB');
    const time = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    return { date, time };
  };

  const handleCustomerSelect = (selectedCustomer) => {
    setCustomer(selectedCustomer);
    setCustomerID(selectedCustomer.customerId);
    setSearchQuery(selectedCustomer.name);
  };

  const { date, time } = getCurrentDateTime();
  const renderPaymentFields = () => {
    if (paymentMethod === 'Cash') {
      return (
        <>
          <div className="mt-4">
            <label className="block text-xs font-medium text-gray-700">Cash Payment</label>
            <input
              type="number"
              value={cashPaid}
              onChange={(e) => setCashPaid(e.target.value)}
              className="block w-full text-sm font-bold bg-gray-200 text-gray-700 border border-gray-100 rounded py-2 px-4 leading-tight focus:outline-secondary focus:bg-gray-50"
              placeholder="Enter cash amount"
            />
          </div>
          <div className="mt-4">
            <label className="block text-xs font-medium text-gray-700">Balance</label>
            <p className="block w-full text-sm font-bold bg-gray-200 text-gray-700 border border-gray-100 rounded py-2 px-4 leading-tight">
              LKR {formatPrice(calculateBalance())}
            </p>
          </div>
        </>
      );
    } else if (paymentMethod === 'Card') {
      return (
        <div className="mt-4">
          <label className="block text-xs font-medium text-gray-700">Invoice Number</label>
          <input
            type="text"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            className="block w-full text-sm font-bold bg-gray-200 text-gray-700 border border-gray-100 rounded py-2 px-4 leading-tight focus:outline-secondary focus:bg-gray-50"
            placeholder="Enter invoice number"
          />
        </div>
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white rounded-md w-2/3 xl:w-1/2 h-auto overflow-hidden">
        <div className="flex justify-between py-2 px-4 items-center text-tColor bg-primary">
          <h2 className="font-bold">Pay Order</h2>
          <IoMdCloseCircle className="cursor-pointer text-lg" onClick={onClose} />
        </div>
        <div className="flex">
          <CustomerRegisterForm
            shopId={shopId}
            userId={userId}
            onCustomerSelect={handleCustomerSelect}
          />
          <div className='w-2/3 py-2 px-4 flex flex-col justify-between'>
            <div className=''>
              <p className='text-xs xl:text-sm font-bold pb-2'>Payment Method</p>
              <div className='grid grid-cols-2 h-12 gap-2 text-xs font-medium'>
                <button
                  className={`w-full rounded-md flex items-center justify-center ${paymentMethod === 'Cash' ? 'bg-merunRed text-white' : 'bg-gray-200'}`}
                  onClick={() => setPaymentMethod('Cash')}
                >
                  Cash
                </button>
                <button
                  className={`w-full rounded-md flex items-center justify-center ${paymentMethod === 'Card' ? 'bg-merunRed text-white' : 'bg-gray-200'}`}
                  onClick={() => setPaymentMethod('Card')}
                >
                  Card
                </button>
              </div>

              <div className="mt-4">
                <p className="block text-xs font-medium text-gray-700">Total Amount</p>
                <p className="block w-full text-sm font-bold bg-gray-200 text-gray-700 border border-gray-100 rounded py-2 px-4 leading-tight focus:outline-secondary focus:bg-gray-50">LKR  {totalAmount}
                </p>
              </div>
              {renderPaymentFields()}
            </div>
            <div className="mt-2 flex justify-end gap-2">
              <ReactToPrint
                trigger={() => <MainButton text='Generate KOT' />}
                content={() => KOTComponentRef.current}
              />
              {/*<ReactToPrint
                trigger={() => <MainButton text='Generate Bill' />}
                content={() => BillComponentRef.current}
              />
              
              <MainButton text='Pay' onClick={handlePayOrder} />*/}
              {/*<MainButton text='check' onClick={handleCheck} />*/}
              <ReactToPrint
                trigger={() => (
                  <MainButton
                    text="Pay Bill"
                  />
                )}
                content={() => BillComponentRef.current}
                onBeforeGetContent={() => {
                  handlePayOrder();
                }}
                onAfterPrint={() => {
                  onClose();
                }}
              />
            </div>
          </div>
        </div>
      </div>
      <div className='hidden'>
        <KOT
          ref={KOTComponentRef}
          billNumber={billNumber}
          cartItems={cartItems}
          time={time}
        />
        <Bill
          ref={BillComponentRef}
          discount={discount}
          billNumber={billNumber}
          cartItems={cartItems}
          subTotal={subTotal}
          totalAmount={totalAmount}
          cashAmount={cashPaid}
          balance={calculateBalance()}
          serviceCharges={serviceCharges}
          walletAmount={0}
          walletBalance={0}
          paymentMethod={paymentMethod}
          customer={customer ? customer.name : 'Guest'}
          date={date}
          time={time}
        />
      </div>
    </div>
  );
};

export default PayOrderForm;
