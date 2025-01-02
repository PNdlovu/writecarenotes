export const medical = {
  medication: {
    common: [
      'Horario de Administración',
      'Dosificación',
      'Efectos Secundarios',
      'Contraindicaciones',
      'Requisitos de Almacenamiento'
    ],
    anticoagulant: {
      warfarin: 'Warfarina',
      'INR': 'INR',
      'INR.full': 'Razón Internacional Normalizada'
    },
    painManagement: {
      paracetamol: 'Paracetamol',
      ibuprofen: 'Ibuprofeno',
      codeine: 'Codeína'
    }
  },
  condition: {
    common: [
      'Síntomas',
      'Factores de Riesgo',
      'Requisitos de Monitorización',
      'Ajustes del Plan de Cuidados',
      'Señales de Emergencia'
    ],
    cardiac: {
      'AF': 'FA',
      'AF.full': 'Fibrilación Auricular',
      'MI': 'IM',
      'MI.full': 'Infarto de Miocardio',
      hypertension: 'Hipertensión'
    },
    respiratory: {
      'COPD': 'EPOC',
      'COPD.full': 'Enfermedad Pulmonar Obstructiva Crónica',
      asthma: 'Asma'
    }
  },
  procedure: {
    common: [
      'Equipo Necesario',
      'Requisitos de Personal',
      'Documentación',
      'Cuidados Posteriores',
      'Evaluación de Riesgos'
    ],
    wound: {
      dressing: 'Vendaje de Herida',
      assessment: 'Evaluación de Herida',
      'VAC': 'TPN',
      'VAC.full': 'Terapia de Presión Negativa'
    },
    mobility: {
      transfer: 'Transferencia del Paciente',
      hoisting: 'Procedimiento de Elevación',
      walkingAid: 'Evaluación de Ayuda para Caminar'
    }
  },
  vital: {
    common: [
      'Presión Arterial',
      'Frecuencia Cardíaca',
      'Frecuencia Respiratoria',
      'Temperatura',
      'Saturación de Oxígeno'
    ],
    'BP': 'PA',
    'BP.full': 'Presión Arterial',
    'HR': 'FC',
    'HR.full': 'Frecuencia Cardíaca',
    'RR': 'FR',
    'RR.full': 'Frecuencia Respiratoria',
    'SpO2': 'SpO2',
    'SpO2.full': 'Saturación de Oxígeno'
  }
} as const;
