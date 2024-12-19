export const medical = {
  medication: {
    common: [
      'Administration Schedule',
      'Dosage',
      'Side Effects',
      'Contraindications',
      'Storage Requirements'
    ],
    anticoagulant: {
      warfarin: 'Warfarin',
      'INR': 'INR',
      'INR.full': 'International Normalized Ratio'
    },
    painManagement: {
      paracetamol: 'Paracetamol',
      ibuprofen: 'Ibuprofen',
      codeine: 'Codeine'
    }
  },
  condition: {
    common: [
      'Symptoms',
      'Risk Factors',
      'Monitoring Requirements',
      'Care Plan Adjustments',
      'Emergency Signs'
    ],
    cardiac: {
      'AF': 'AF',
      'AF.full': 'Atrial Fibrillation',
      'MI': 'MI',
      'MI.full': 'Myocardial Infarction',
      hypertension: 'Hypertension'
    },
    respiratory: {
      'COPD': 'COPD',
      'COPD.full': 'Chronic Obstructive Pulmonary Disease',
      asthma: 'Asthma'
    }
  },
  procedure: {
    common: [
      'Required Equipment',
      'Staff Requirements',
      'Documentation',
      'Follow-up Care',
      'Risk Assessment'
    ],
    wound: {
      dressing: 'Wound Dressing',
      assessment: 'Wound Assessment',
      'VAC': 'VAC',
      'VAC.full': 'Vacuum Assisted Closure'
    },
    mobility: {
      transfer: 'Patient Transfer',
      hoisting: 'Hoisting Procedure',
      walkingAid: 'Walking Aid Assessment'
    }
  },
  vital: {
    common: [
      'Blood Pressure',
      'Heart Rate',
      'Respiratory Rate',
      'Temperature',
      'Oxygen Saturation'
    ],
    'BP': 'BP',
    'BP.full': 'Blood Pressure',
    'HR': 'HR',
    'HR.full': 'Heart Rate',
    'RR': 'RR',
    'RR.full': 'Respiratory Rate',
    'SpO2': 'SpO2',
    'SpO2.full': 'Oxygen Saturation'
  }
} as const;
