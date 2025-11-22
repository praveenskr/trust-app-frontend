export interface SerialNumberConfigCreateDTO {
  entityType: string;
  prefix: string;
  formatPattern?: string;
  currentYear: number;
  lastSequence: number;
  sequenceLength: number;
}

export interface SerialNumberConfigDTO {
  id: number;
  entityType: string;
  prefix: string;
  formatPattern?: string;
  currentYear: number;
  lastSequence: number;
  sequenceLength: number;
  createdAt: string;
  updatedAt: string;
}

export interface SerialNumberConfigUpdateDTO {
  prefix: string;
  formatPattern?: string;
  sequenceLength?: number;
}

export interface SerialNumberNextResponseDTO {
  nextSerialNumber: string;
  entityType: string;
}

