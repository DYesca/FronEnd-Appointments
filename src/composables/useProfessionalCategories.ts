import { ref, computed } from 'vue';

// Datos centralizados de categorías profesionales
const experienceOptions = [
  { value: 'ninguno', label: 'Ninguno' },
  { value: '1-2', label: 'De 1 a 2 años' },
  { value: '2-4', label: 'De 2 a 4 años' },
  { value: 'mas-5', label: 'Más de 5 años' }
];

const medicos = [
  { label: "General", img: "https://placehold.co/70x70" },
  { label: "Pediatría", img: "https://placehold.co/70x70" },
  { label: "Ginecología", img: "https://placehold.co/70x70" },
  { label: "Cardiología", img: "https://placehold.co/70x70" },
  { label: "Neurología", img: "https://placehold.co/70x70" },
  { label: "Dermatología", img: "https://placehold.co/70x70" },
  { label: "Oftalmología", img: "https://placehold.co/70x70" },
  { label: "Psiquiatría", img: "https://placehold.co/70x70" }
];

const informaticos = [
  { label: "Redes", img: "https://placehold.co/70x70" },
  { label: "Desarrollo Web", img: "https://placehold.co/70x70" },
  { label: "Sistemas", img: "https://placehold.co/70x70" },
  { label: "Soporte Técnico", img: "https://placehold.co/70x70" },
  { label: "Ciberseguridad", img: "https://placehold.co/70x70" },
  { label: "Base de Datos", img: "https://placehold.co/70x70" },
  { label: "Móvil", img: "https://placehold.co/70x70" }
];

const construccion = [
  { label: "Obrero", img: "https://placehold.co/70x70" },
  { label: "Ingeniero", img: "https://placehold.co/70x70" },
  { label: "Supervisor", img: "https://placehold.co/70x70" },
  { label: "Arquitecto", img: "https://placehold.co/70x70" },
  { label: "Electricista", img: "https://placehold.co/70x70" },
  { label: "Plomero", img: "https://placehold.co/70x70" },
  { label: "Soldador", img: "https://placehold.co/70x70" },
  { label: "Pintor", img: "https://placehold.co/70x70" }
];

const transporte = [
  { label: "Camioneta", img: "https://placehold.co/70x70" },
  { label: "Moto", img: "https://placehold.co/70x70" },
  { label: "Flete", img: "https://placehold.co/70x70" },
  { label: "Camión", img: "https://placehold.co/70x70" },
  { label: "Taxi", img: "https://placehold.co/70x70" },
  { label: "Bus", img: "https://placehold.co/70x70" },
  { label: "Grúa", img: "https://placehold.co/70x70" }
];

// Composable para manejar filtros de búsqueda
export const useProfessionalCategories = () => {
  // Estados reactivos para filtros
  const searchQuery = ref('');
  const selectedExperience = ref('');
  const selectedMedicos = ref<string[]>([]);
  const selectedInformaticos = ref<string[]>([]);
  const selectedConstruccion = ref<string[]>([]);
  const selectedTransporte = ref<string[]>([]);

  // Funciones para manejar checkboxes
  const toggleMedico = (label: string) => {
    const index = selectedMedicos.value.indexOf(label);
    if (index > -1) {
      selectedMedicos.value.splice(index, 1);
    } else {
      selectedMedicos.value.push(label);
    }
  };

  const toggleInformatico = (label: string) => {
    const index = selectedInformaticos.value.indexOf(label);
    if (index > -1) {
      selectedInformaticos.value.splice(index, 1);
    } else {
      selectedInformaticos.value.push(label);
    }
  };

  const toggleConstruccion = (label: string) => {
    const index = selectedConstruccion.value.indexOf(label);
    if (index > -1) {
      selectedConstruccion.value.splice(index, 1);
    } else {
      selectedConstruccion.value.push(label);
    }
  };

  const toggleTransporte = (label: string) => {
    const index = selectedTransporte.value.indexOf(label);
    if (index > -1) {
      selectedTransporte.value.splice(index, 1);
    } else {
      selectedTransporte.value.push(label);
    }
  };

  // Función para limpiar filtros
  const clearFilters = () => {
    searchQuery.value = '';
    selectedExperience.value = '';
    selectedMedicos.value = [];
    selectedInformaticos.value = [];
    selectedConstruccion.value = [];
    selectedTransporte.value = [];
  };

  // Función para obtener filtros activos
  const getActiveFilters = () => {
    return {
      searchQuery: searchQuery.value,
      experience: selectedExperience.value,
      medicos: selectedMedicos.value,
      informaticos: selectedInformaticos.value,
      construccion: selectedConstruccion.value,
      transporte: selectedTransporte.value
    };
  };

  // Computed para verificar si hay filtros activos
  const hasActiveFilters = computed(() => {
    return searchQuery.value !== '' ||
           selectedExperience.value !== '' ||
           selectedMedicos.value.length > 0 ||
           selectedInformaticos.value.length > 0 ||
           selectedConstruccion.value.length > 0 ||
           selectedTransporte.value.length > 0;
  });

  return {
    // Datos estáticos
    experienceOptions,
    medicos,
    informaticos,
    construccion,
    transporte,
    
    // Estados reactivos
    searchQuery,
    selectedExperience,
    selectedMedicos,
    selectedInformaticos,
    selectedConstruccion,
    selectedTransporte,
    
    // Funciones
    toggleMedico,
    toggleInformatico,
    toggleConstruccion,
    toggleTransporte,
    clearFilters,
    getActiveFilters,
    
    // Computed
    hasActiveFilters
  };
};
