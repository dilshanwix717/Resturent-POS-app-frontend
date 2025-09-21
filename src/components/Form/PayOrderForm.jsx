import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';
import { MainButton } from '../Button/Button';
import { useNavigate } from 'react-router-dom';
import { IoMdCloseCircle, IoMdTrash } from 'react-icons/io';
import { fetchSellingTypes, createOrder } from '../../api/apiService';
import CustomerRegisterForm from '../../components/Form/CustomerRegisterForm';
import KOT from '../bill/KOT';
import Bill from '../bill/Bill';
import ReactToPrint from 'react-to-print';

const PayOrderForm = ({ totalAmount, discount, subTotal, cartItems, sellingTypeId, onClose, onPayOrder, serviceCharges, billNumber, serviceChargeAuthorizedBy }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [customerID, setCustomerID] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [cashPaid, setCashPaid] = useState("");
  const [cardNumber, setCardNumber] = useState('1234');
  const [cardPaid, setCardPaid] = useState(parseFloat(totalAmount.replace(/,/g, '')) || 0);
  const [sellingType, setSellingType] = useState(null);
  const [isSplitPayment, setIsSplitPayment] = useState(false)
  const [splitPayments, setSplitPayments] = useState([{ type: "Cash", amount: 0 }])
  const companyId = localStorage.getItem('companyId');
  const userId = localStorage.getItem('userId');
  const shopId = localStorage.getItem('shopId');
  const navigate = useNavigate();
  const KOTComponentRef = useRef(null);
  const BillComponentRef = useRef(null);

  const calculateBalance = () => {
    const total = parseFloat(totalAmount.replace(/,/g, '')) || 0;
    let cash = cashPaid ? parseFloat(cashPaid) || 0 : 0;
    let card = cardPaid ? parseFloat(cardPaid) || 0 : 0;

    if (isSplitPayment) {
      cash = splitPayments
        .filter(payment => payment.type === 'Cash')
        .reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0);

      card = splitPayments
        .filter(payment => payment.type === 'Card')
        .reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0);
    }

    if (paymentMethod === 'Cash') {
      return cash - total;
    } else if (paymentMethod === 'Card') {
      return card - total;
    } else if (paymentMethod === 'Split') {
      return card + cash - total;
    }
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

  // In PayOrderForm.js, update the handlePayOrder function:

  // In PayOrderForm.js, update the handlePayOrder function:

  const handlePayOrder = async () => {
    const parsedTotalAmount = parseFloat(totalAmount.replace(/,/g, '')) || 0;
    let parsedCashPaid = parseFloat(cashPaid) || 0;
    let parsedCardPaid = parsedTotalAmount;

    if (paymentMethod === 'Split') {
      parsedCashPaid = splitPayments
        .filter(payment => payment.type === 'Cash')
        .reduce((sum, payment) => sum + parseFloat(payment.amount), 0);

      parsedCardPaid = splitPayments
        .filter(payment => payment.type === 'Card')
        .reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
    } else if (paymentMethod === 'Cash') {
      parsedCardPaid = 0.0;
    } else if (paymentMethod === 'Card') {
      parsedCashPaid = 0.0;
    }

    if (!customerID || customerID.trim() === '') {
      toast.error('Please select a customer.');
      return;
    }

    if (paymentMethod === 'Cash' && parsedCashPaid < parsedTotalAmount) {
      toast.error('Cash paid is less than the total amount.');
      return;
    }

    if (paymentMethod === 'Card' && parsedCardPaid < parsedTotalAmount) {
      toast.error('Amount paid is less than the total amount.');
      return;
    }

    const items = cartItems.map(item => {
      const sellingFinalPrice = calculateSellingFinalPrice(item.sellingPrice, item.sellingTypeCommission);

      // Calculate the standard discount (from the product's discount field)
      let standardDiscountAmount = 0;
      if (item.discount) {
        standardDiscountAmount = calculateDiscountAmount(sellingFinalPrice, item.discount);
      }

      // Add any custom discount that was applied through the DiscountItemForm
      const totalDiscountAmount = standardDiscountAmount + (item.customDiscount || 0);

      return {
        productId: item.productId,
        sellingPrice: sellingFinalPrice,
        discountAmount: totalDiscountAmount,
        discountAuthorizedBy: item.discountAuthorizedBy || null,
        discountAuthorizedByName: item.discountAuthorizedByName || null,
        quantity: item.quantity,
      };
    });

    // Calculate the subtotal (total before service charge)
    const subtotal = cartItems.reduce((sum, item) => {
      const sellingFinalPrice = calculateSellingFinalPrice(item.sellingPrice, item.sellingTypeCommission);
      const discountAmount = (item.discount ? calculateDiscountAmount(sellingFinalPrice, item.discount) : 0) +
        (item.customDiscount || 0);
      return sum + ((sellingFinalPrice - discountAmount) * item.quantity);
    }, 0);

    // Parse service charge information
    let serviceChargeAmount = 0;
    let serviceChargePercentage = 0;

    if (typeof serviceCharges === 'string' && serviceCharges.endsWith('%')) {
      serviceChargePercentage = parseFloat(serviceCharges);
      serviceChargeAmount = (subtotal * serviceChargePercentage) / 100;
    } else {
      serviceChargeAmount = parseFloat(serviceCharges) || 0;
    }

    const orderData = {
      companyId: companyId,
      shopId: shopId,
      userId: userId,
      order: {
        invoiceID: `INV-${billNumber}`,
        billTotal: parsedTotalAmount,
        cashAmount: paymentMethod === 'Cash' || paymentMethod === 'Split' ? parsedCashPaid : 0,
        cardAmount: paymentMethod === 'Card' || paymentMethod === 'Split' ? parsedCardPaid : 0,
        cardDigits: paymentMethod === 'Card' || (paymentMethod === 'Split' && parsedCardPaid > 0) ? cardNumber : '',
        walletIn: 0,
        walletOut: 0,
        otherPayment: 0,
        loyaltyPoints: 0,
        customerId: customerID,
        sellingTypeID: sellingTypeId,
        sellingType: sellingType,
        sellingTypeCharge: serviceCharges,
        sellingTypeAmount: serviceChargeAmount,
        // Add service charge authorization details
        serviceChargeAuthorizedBy: serviceChargeAuthorizedBy || null,
        // serviceChargeAuthorizedByName: serviceChargeAuthorizedByName || null,
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
    console.log(selectedCustomer);
  };

  const { date, time } = getCurrentDateTime();
  const renderPaymentFields = (index) => {
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
          <label className="block text-xs font-medium text-gray-700">Card Payment</label>
          <input
            type="number"
            value={cardPaid}
            onChange={(e) => setCardPaid(e.target.value)}
            className="block w-full text-sm font-bold bg-gray-200 text-gray-700 border border-gray-100 rounded py-2 px-4 leading-tight focus:outline-secondary focus:bg-gray-50"
            placeholder="Card payment"
          />
          {/* <label className="block text-xs font-medium text-gray-700 mt-4">Card Number</label>
          <input
            type="text"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            className="block w-full text-sm font-bold bg-gray-200 text-gray-700 border border-gray-100 rounded py-2 px-4 leading-tight focus:outline-secondary focus:bg-gray-50"
            placeholder="Enter card number"
          /> */}
        </div>
      );
    } else if (paymentMethod === 'Split') {
      if (splitPayments[index] && splitPayments[index].type === 'Cash') {
        return (
          <>
            <div className="mt-4">
              <label className="block text-xs font-medium text-gray-700">Cash Payment</label>
              <input
                type="number"
                value={splitPayments[index].amount}
                onChange={(e) =>
                  setSplitPayments(prev => {
                    const newSplitPayments = [...prev];
                    newSplitPayments[index] = { type: 'Cash', amount: e.target.value };
                    return newSplitPayments;
                  })
                }
                className="block w-full text-sm font-bold bg-gray-200 text-gray-700 border border-gray-100 rounded py-2 px-4 leading-tight focus:outline-secondary focus:bg-gray-50"
                placeholder="Enter cash amount"
              />
            </div>
          </>
        );
      } else if (splitPayments[index] && splitPayments[index].type === 'Card') {
        return (
          <div className="mt-4">
            <label className="block text-xs font-medium text-gray-700">Card Payment</label>
            <input
              type="number"
              value={splitPayments[index].amount}
              onChange={(e) =>
                setSplitPayments(prev => {
                  const newSplitPayments = [...prev];
                  newSplitPayments[index] = { type: 'Card', amount: e.target.value };
                  return newSplitPayments;
                })
              }
              className="block w-full text-sm font-bold bg-gray-200 text-gray-700 border border-gray-100 rounded py-2 px-4 leading-tight focus:outline-secondary focus:bg-gray-50"
              placeholder="Card payment"
            />
            {/* <label className="block text-xs font-medium text-gray-700 mt-4">Card Number</label>
            <input
              type="text"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              className="block w-full text-sm font-bold bg-gray-200 text-gray-700 border border-gray-100 rounded py-2 px-4 leading-tight focus:outline-secondary focus:bg-gray-50"
              placeholder="Enter card number"
            /> */}
          </div>
        );
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white rounded-md w-2/3 xl:w-1/2 max-h-90% overflow-y-auto slider">
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
            {!isSplitPayment &&
              <div className=''>
                <div className='flex flex-row mb-1 items-center gap-x-1'>
                  <p className='grow text-xs xl:text-sm font-bold pb-2'>Payment Method</p>
                  <p className='text-xxs xl:text-xs font-medium'>Split Payment</p>
                  <div className='relative flex w-10 my-0.5 p-1 bg-gray-200 rounded-full items-center'>
                    <div className='size-4 rounded-full  bg-transparent'></div>
                    <div className={`cursor-pointer absolute size-4 rounded-full ${isSplitPayment ? 'right-1 bg-secondary' : 'left-1 bg-white'}`}
                      onClick={() => {
                        setIsSplitPayment(!isSplitPayment);
                        setPaymentMethod('Split');
                      }}
                    >
                    </div>
                  </div>
                </div>
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
            }

            {isSplitPayment &&
              <div>
                <div className='flex flex-row mb-1 items-center gap-x-1'>
                  <p className='grow text-xs xl:text-sm font-bold pb-2'>Payment Method</p>
                  <p className='text-xxs xl:text-xs font-medium'>Split Payment</p>
                  <div className='relative flex w-10 my-0.5 p-1 bg-gray-200 rounded-full items-center'>
                    <div className='size-4 rounded-full  bg-transparent'></div>
                    <div className={`cursor-pointer absolute size-4 rounded-full ${isSplitPayment ? 'right-1 bg-secondary' : 'left-1 bg-white'}`}
                      onClick={() => {
                        setIsSplitPayment(!isSplitPayment);
                        setPaymentMethod('Split');
                      }}
                    >
                    </div>
                  </div>
                </div>

                {splitPayments.map((splitPayment, index) => (
                  <div className='mb-4' key={index}>
                    <div className='flex flex-row h-12 gap-2 text-xs font-medium items-center'>
                      <button
                        className={`w-full h-full rounded-md flex items-center justify-center ${splitPayments[index] && splitPayments[index].type === 'Cash' ? 'bg-merunRed text-white' : 'bg-gray-200'}`}
                        onClick={() => {
                          setSplitPayments(prev => {
                            const newSplitPayments = [...prev];
                            newSplitPayments[index] = { type: 'Cash', amount: 0 };
                            return newSplitPayments;
                          });
                        }}
                      >
                        Cash
                      </button>
                      <button
                        className={`w-full h-full rounded-md flex items-center justify-center ${splitPayments[index] && splitPayments[index].type === 'Card' ? 'bg-merunRed text-white' : 'bg-gray-200'}`}
                        onClick={() => {
                          setSplitPayments(prev => {
                            const newSplitPayments = [...prev];
                            newSplitPayments[index] = { type: 'Card', amount: 0 };
                            return newSplitPayments;
                          });
                        }}
                      >
                        Card
                      </button>

                      <IoMdTrash
                        className="cursor-pointer text-4xl hover:text-red-500"
                        onClick={() => {
                          setSplitPayments(prev =>
                            prev.filter((_, i) => i !== index)
                          )
                        }}
                      />

                    </div>
                    <div className="mt-4">
                      <p className="block text-xs font-medium text-gray-700">Total Amount</p>
                      <p className="block w-full text-sm font-bold bg-gray-200 text-gray-700 border border-gray-100 rounded py-2 px-4 leading-tight focus:outline-secondary focus:bg-gray-50">LKR  {totalAmount}
                      </p>
                    </div>
                    {renderPaymentFields(index)}
                  </div>
                ))}

                <div className="my-4">
                  <label className="block text-xs font-medium text-gray-700">Balance</label>
                  <p className="block w-full text-sm font-bold bg-gray-200 text-gray-700 border border-gray-100 rounded py-2 px-4 leading-tight">
                    LKR {formatPrice(calculateBalance())}
                  </p>
                </div>

                <button className='w-full p-2 font-bold rounded-md bg-gray-200 flex items-center justify-center' onClick={() => setSplitPayments(prev => [...prev, { type: 'Cash', amount: 0 }])}> + Add Payment Method</button>
              </div>
            }
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
