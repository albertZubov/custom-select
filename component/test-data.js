export const data = {
  name: 'car',
  title: {
    multi: 'Multi',
    single: 'Single',
  },
  value: {
    multi: 'multi',
    single: 'single',
  },
  multiSelect: true,
  placeholder: 'Список автомобилей',
  options: [
    {
      value: 'volkswagen',
      title: 'Volkswagen',
      id: 3211,
      // groupId: 'middle',
    },
    {
      value: 'ford',
      title: 'Ford',
      id: 5435,
      groupId: null,
    },
    {
      value: 'toyota',
      title: 'Toyota',
      id: 6546,
      groupId: 6221,
    },
    {
      value: 'nissan',
      title: 'Nissan',
      id: 8234,
      groupId: 6142,
    },
    {
      value: 'hyundai',
      title: 'Hyundai',
      id: 8642,
      groupId: 6221,
    },
    {
      value: 'honda',
      title: 'Honda',
      id: 3531,
      groupId: 8254,
    },
    {
      value: 'suzuki',
      title: 'Suzuki',
      id: 1765,
      groupId: 6142,
    },
    {
      value: 'citroen',
      title: 'Citroen',
      id: 9877,
      groupId: 6221,
    },
    {
      value: 'opel',
      title: 'Opel',
      id: 9534,
      groupId: 8543,
    },
    {
      value: 'chrysler',
      title: 'Chrysler',
      id: 4257,
      groupId: 8543,
    },
  ],
  groups: [
    {
      id: 6221,
      value: 'economy',
      title: 'Economy class',
    },
    {
      id: 8254,
      value: 'middle',
      title: 'Middle class',
    },
    {
      id: 8543,
      value: 'business',
      title: 'Business class',
    },
    {
      id: 6142,
      value: 'sport',
      title: 'Sport class',
    },
  ],
  maxVisibleOptions: 7,
  groupOptions: true,
};
