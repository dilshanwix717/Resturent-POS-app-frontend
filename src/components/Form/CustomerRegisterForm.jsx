import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { MainButton } from '../Button/Button';
import { registerCustomer, fetchCustomerById } from '../../api/apiService';

const CustomerRegisterForm = ({ shopId, userId, onCustomerSelect }) => {
  const [customer, setCustomer] = useState({
    phoneNumber: "",
    name: "",
    email: "",
    address: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const getAllCustomers = async () => {
      try {
        const customers = await fetchCustomerById();
        console.log("at use effect: ", customers);
        console.log(Array.isArray(customers));

        const walkInCustomer = customers.find((customer) => customer.customerId === "CustomerID-1");
        console.log("Found Customer: ", walkInCustomer);
        handleSuggestionClick(walkInCustomer);
      } catch (error) {
        console.error("Error getting customers");
      }
    }

    getAllCustomers();
  }, [])

  // Handle customer registration
  const handleRegister = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10}$/;

    if (!customer.name.trim()) {
      toast.error("Please enter a Customer Name.");
      return;
    }

    if (!emailRegex.test(customer.email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    if (!phoneRegex.test(customer.phoneNumber)) {
      toast.error("Please enter a valid 10-digit mobile number.");
      return;
    }

    try {
      const newCustomer = await registerCustomer({
        contactNumber: customer.phoneNumber,
        shopId,
        name: customer.name,
        email: customer.email,
        customerType: "regular",
        loyaltyId: "",
        walletId: "",
        createdBy: userId,
        address: customer.address,
      });

      toast.success("Customer created successfully!");

      // Clear customer data
      setCustomer({
        phoneNumber: "",
        name: "",
        email: "",
        address: "",
      });

      onCustomerSelect(newCustomer);
    } catch (error) {
      toast.error("Failed to create customer. Please try again.");
    }
  };

  // Handle customer search
  const handleSearchChange = async (e) => {
    const query = e.target.value.trim();
    setSearchQuery(query);

    if (query) {
      try {
        const customers = await fetchCustomerById();
        const filteredSuggestions = customers
          .filter(
            (cust) =>
              cust.name.toLowerCase().includes(query.toLowerCase()) ||
              cust.contactNumber.includes(query)
          )
          .slice(0, 5);

        setSuggestions(filteredSuggestions);
      } catch (error) {
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    onCustomerSelect(suggestion);
    setSearchQuery(suggestion.name);
    setSuggestions([]);
  };

  return (
    <div className="w-1/3 p-4 border-r-2 border-dashed">
      {/* Customer Search */}
      <div className="relative mt-2">
        <label className="block text-xs font-medium text-gray-700">
          Registered Customers
        </label>
        <input
          className="block w-full text-xs xl:text-sm bg-secondary text-black font-medium border border-gray-100 rounded py-2 px-4 leading-tight focus:outline-secondary"
          value={searchQuery}
          onChange={handleSearchChange}
        />
        {searchQuery && (
          <ul className="absolute w-full mt-2 bg-white rounded-md shadow-lg z-10">
            {suggestions.slice(0, 4).map((item) => (
              <li
                key={item._id}
                className="cursor-pointer px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => handleSuggestionClick(item)}
              >
                <div>{item.name}</div>
                <div className="text-xs text-gray-500">{item.contactNumber}</div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Registration Form */}
      <div className="mt-2">
        <label className="block text-xs font-medium text-gray-700">
          Phone Number
        </label>
        <input
          type="number"
          value={customer.phoneNumber}
          onChange={(e) =>
            setCustomer({ ...customer, phoneNumber: e.target.value })
          }
          className="block w-full text-xs xl:text-sm bg-gray-200 text-gray-700 border border-gray-100 rounded p-2 leading-tight focus:outline-secondary focus:bg-gray-50"
        />
      </div>
      <div className="mt-2">
        <label className="block text-xs font-medium text-gray-700">
          Customer Name
        </label>
        <input
          type="text"
          value={customer.name}
          onChange={(e) =>
            setCustomer({ ...customer, name: e.target.value })
          }
          className="block w-full text-xs xl:text-sm bg-gray-200 text-gray-700 border border-gray-100 rounded p-2 leading-tight focus:outline-secondary focus:bg-gray-50"
        />
      </div>
      <div className="mt-2">
        <label className="block text-xs font-medium text-gray-700">Email</label>
        <input
          type="email"
          value={customer.email}
          onChange={(e) =>
            setCustomer({ ...customer, email: e.target.value })
          }
          className="block w-full text-xs xl:text-sm bg-gray-200 text-gray-700 border border-gray-100 rounded p-2 leading-tight focus:outline-secondary focus:bg-gray-50"
        />
      </div>
      <div className="mt-2">
        <label className="block text-xs font-medium text-gray-700">
          Address
        </label>
        <input
          type="text"
          value={customer.address}
          onChange={(e) =>
            setCustomer({ ...customer, address: e.target.value })
          }
          className="block w-full text-xs xl:text-sm bg-gray-200 text-gray-700 border border-gray-100 rounded p-2 leading-tight focus:outline-secondary focus:bg-gray-50"
        />
      </div>
      <div className="mt-2 flex flex-col">
        <MainButton text="Register" onClick={handleRegister} />
      </div>
    </div>
  );
};

export default CustomerRegisterForm;