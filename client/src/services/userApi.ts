import { api } from './api';

export function getCustomers() {
  return api.get('/users/customers');
}
