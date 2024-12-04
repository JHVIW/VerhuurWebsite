import React from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { useStore } from '../lib/store';
import { Save } from 'lucide-react';
import type { Settings } from '../types';

export default function Settings() {
  const settings = useStore((state) => state.settings);
  const updateSettings = useStore((state) => state.updateSettings);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: settings || {
      invoiceTemplate: {
        companyName: '',
        companyAddress: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: '',
        },
        companyPhone: '',
        companyEmail: '',
        vatNumber: '',
        bankDetails: {
          accountName: '',
          accountNumber: '',
          bankName: '',
          swiftCode: '',
          iban: '',
        },
        footer: '',
      },
      theme: 'light',
      currency: 'USD',
      dateFormat: 'MM/dd/yyyy',
    },
  });

  const onSubmit = (data: Settings) => {
    updateSettings(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Settings
        </h1>
        <Button icon={Save} type="submit" form="settings-form">
          Save Changes
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <form id="settings-form" onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="space-y-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white border-b pb-2">
              Invoice Template
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Company Name"
                {...register('invoiceTemplate.companyName', { required: 'Company name is required' })}
                error={errors.invoiceTemplate?.companyName?.message}
              />
              <Input
                label="VAT Number"
                {...register('invoiceTemplate.vatNumber')}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-md font-medium">Company Address</h3>
              <Input
                label="Street"
                {...register('invoiceTemplate.companyAddress.street', { required: 'Street is required' })}
                error={errors.invoiceTemplate?.companyAddress?.street?.message}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="City"
                  {...register('invoiceTemplate.companyAddress.city', { required: 'City is required' })}
                  error={errors.invoiceTemplate?.companyAddress?.city?.message}
                />
                <Input
                  label="State"
                  {...register('invoiceTemplate.companyAddress.state', { required: 'State is required' })}
                  error={errors.invoiceTemplate?.companyAddress?.state?.message}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="ZIP Code"
                  {...register('invoiceTemplate.companyAddress.zipCode', { required: 'ZIP code is required' })}
                  error={errors.invoiceTemplate?.companyAddress?.zipCode?.message}
                />
                <Input
                  label="Country"
                  {...register('invoiceTemplate.companyAddress.country', { required: 'Country is required' })}
                  error={errors.invoiceTemplate?.companyAddress?.country?.message}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Company Phone"
                {...register('invoiceTemplate.companyPhone', { required: 'Phone is required' })}
                error={errors.invoiceTemplate?.companyPhone?.message}
              />
              <Input
                label="Company Email"
                type="email"
                {...register('invoiceTemplate.companyEmail', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
                error={errors.invoiceTemplate?.companyEmail?.message}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-md font-medium">Bank Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Account Name"
                  {...register('invoiceTemplate.bankDetails.accountName', { required: 'Account name is required' })}
                  error={errors.invoiceTemplate?.bankDetails?.accountName?.message}
                />
                <Input
                  label="Account Number"
                  {...register('invoiceTemplate.bankDetails.accountNumber', { required: 'Account number is required' })}
                  error={errors.invoiceTemplate?.bankDetails?.accountNumber?.message}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Bank Name"
                  {...register('invoiceTemplate.bankDetails.bankName', { required: 'Bank name is required' })}
                  error={errors.invoiceTemplate?.bankDetails?.bankName?.message}
                />
                <Input
                  label="SWIFT Code"
                  {...register('invoiceTemplate.bankDetails.swiftCode', { required: 'SWIFT code is required' })}
                  error={errors.invoiceTemplate?.bankDetails?.swiftCode?.message}
                />
              </div>
              <Input
                label="IBAN"
                {...register('invoiceTemplate.bankDetails.iban', { required: 'IBAN is required' })}
                error={errors.invoiceTemplate?.bankDetails?.iban?.message}
              />
            </div>

            <div>
              <Input
                label="Invoice Footer"
                {...register('invoiceTemplate.footer')}
                placeholder="Thank you for your business!"
              />
            </div>

            <div>
              <Input
                label="Logo URL"
                {...register('invoiceTemplate.logo')}
                placeholder="https://example.com/logo.png"
              />
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white border-b pb-2">
              General Settings
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Currency
                </label>
                <select
                  {...register('currency')}
                  className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm
                    focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500
                    dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Date Format
                </label>
                <select
                  {...register('dateFormat')}
                  className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm
                    focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500
                    dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                >
                  <option value="MM/dd/yyyy">MM/DD/YYYY</option>
                  <option value="dd/MM/yyyy">DD/MM/YYYY</option>
                  <option value="yyyy-MM-dd">YYYY-MM-DD</option>
                </select>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}