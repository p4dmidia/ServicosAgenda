import { Appointment, Professional, Client, ServiceItem, AttentionItem } from '../types';

export const APP_IMAGES = {
  logo: 'https://lh3.googleusercontent.com/aida/AEtjO1W34lxyqN0ysbcuySvyaLRCbmOy2jEfHGzDf3ynzN3q93jMBSkNY-_I2owX_ghQU73SaEYnBDr3-W61s05fnXNAhgc4CPobrOflz5YJ1Qwdyt7Qwnf6yDivNdUc57I0-8F6KvZ1imDZqs2nOkedM4JSmaeWIcPkcCa_QwQ-AqVhfHBRSkWvTQHW8qL0-xr9OLkABLpeVimCdqm8GUGIoy8JJgkpJxldaAHlT29rpHNwJyN7EVp9hf6lasQ',
  marianeProfile: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAbkzKIQvts0XHmRFHEOAk5VSpm2j3z536TQ8Fqp-YsNyTffrpESwl0Pp5Bscl-ZyhaXyeMAoN9_gIhbLXbX9RkLqmN-Mfq66HHdoak7MT6lcB6o5T5NK6jVdhywVp3iQAtUU6_cbMW4Wnz5Ws_E56Tp8_AGkSeXk5ArUVX3DaO_ns6PrUZv_oFy9HZJ3UxWADH2xANhh4-eKjtDXA-rEEk4jFStddJ97XE5XrfC9hYcv8CbhtYGU8C',
  anaCarolina: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCkCcVeyk1JfaGMh2w8_80949Ys9wKXKqOrv4HCBX1iLDnQYLxzr8TD8qL0ToKdZlZpeRQVaoEH3REtW54yj-iVp2eLmBfxJaAc0lHnuUDdL5QHMYdZIkHR08gaeimxC7Wznp9G426-hShZDeGwX9opo7w3UFzA8qOfHuFqVM5NV8AAr1BJ7JXBJWoClsJZSGQ46D8ap713FnmuYh4O2MORFopTke9it_aCGUyHiw2G1b-leZGRQvOr',
  marcosOliveira: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC0iFcq8c7hTtuJoVWFK-NdFnDDMEFUC4Lo8r76o6KdFMNqtRO7qAz-_zurIeupKgHGUHmFMVGBj9wzAg76uxysFL8SFLxUdDycVatSUrWCJxp9Fjg0EOD7aJOLyI1_qaLvElOqa0u0hT8_RxQjrkgNj4jWwE_pF8jdaCiTR1t1W81Y7tUqbyCKOJLZ9QLVaYalkK7dDh7LSX00nqfXyHUsWQea364CL99HY39Kvw2aABZzQCeKaAtD',
  patriciaAlves: 'https://lh3.googleusercontent.com/aida-public/AB6AXuABqk3hmxP6OtSt7HTtHN7jv28dsgnuzynFeMeHi84EFadPW1WmTdbnDYpJu20XNLrblHeWQhfx4GWgiicQRd8jmeRuKBj2Hr2DfW-wrSql-ZzksEfi1NSPtGMEe4FI_RWxH4k9tpx3fwPTjDmfSb6EltZxOlp0hbKHgwYOq1cwi_JWiJ6-2sih5zEnYFuW-QE5L7KS7Tqs92NYkzE0ioWsytdJ2jcmT-FL-DLjpnUNAKxSKUW3gv52',
  marianaSilveira: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC3pkHar9sAUgnk6WhcvGrvIbqNvH2uplK7021r2R54Rk-HDuCqqSspaviUuK-y60b3BFBCnMooRrirNOx7-p7_Ip-kfPvqSPcfbpbcnQGglSgbLjae1LvrAcxLDpSKZN9zuVs_IG0FCD5C87BlVKqePUbj4JL_6lF9f4YozWYnODq06Ii02gIb_MnTjcAiwxNmXgM72-6gTTWjy5UTMXMaWBh6QQu_daqWPTDsSdTd5c9hnOiXXNB2'
};

export const INITIAL_TODAY_SCHEDULE: Appointment[] = [
  {
    id: 'apt-1',
    time: '09h',
    clientName: 'Ana Carolina',
    clientPhone: '+55 11 98123-4567',
    clientPhoto: APP_IMAGES.anaCarolina,
    service: 'Limpeza de pele profunda',
    professional: 'Dra. Fernanda',
    status: 'CONFIRMADO',
    price: 240,
    duration: '60 min'
  },
  {
    id: 'apt-2',
    time: '10h',
    clientName: 'Marcos Oliveira',
    clientPhone: '+55 11 97654-3210',
    clientPhoto: APP_IMAGES.marcosOliveira,
    service: 'Consulta dermatológica',
    professional: 'Dr. Rafael',
    status: 'AGENDADO',
    price: 350,
    duration: '45 min'
  },
  {
    id: 'apt-3',
    time: '11h',
    clientName: 'Juliana Costa',
    clientPhone: '+55 11 98888-1122',
    clientInitials: 'JC',
    service: 'Procedimento estético',
    professional: 'Dra. Fernanda',
    status: 'CONFIRMADO',
    price: 480,
    duration: '60 min'
  },
  {
    id: 'apt-4',
    time: '13h',
    clientName: 'Patrícia Alves',
    clientPhone: '+55 11 97777-3344',
    clientPhoto: APP_IMAGES.patriciaAlves,
    service: 'Avaliação facial',
    professional: 'Dra. Camila',
    status: 'AGUARDANDO CONFIRMAÇÃO',
    price: 150,
    duration: '30 min'
  },
  {
    id: 'apt-5',
    time: '14h',
    clientName: 'Roberto Lima',
    clientPhone: '+55 11 96666-5544',
    clientInitials: 'RL',
    service: 'Consulta de retorno',
    professional: 'Dr. Rafael',
    status: 'CONFIRMADO',
    price: 0,
    duration: '30 min'
  }
];

export const UPCOMING_APPOINTMENTS_TABLE: Appointment[] = [
  {
    id: 'tbl-1',
    time: '15:00',
    clientName: 'Mariana Silveira',
    clientPhone: '+55 11 98452-1100',
    clientPhoto: APP_IMAGES.marianaSilveira,
    service: 'Harmonização Facial',
    professional: 'Dra. Fernanda',
    status: 'CONFIRMADO',
    price: 1800,
    duration: '90 min'
  },
  {
    id: 'tbl-2',
    time: '15:45',
    clientName: 'Gabriel Santos',
    clientPhone: '+55 11 97103-9944',
    clientInitials: 'GS',
    service: 'Peeling Químico',
    professional: 'Dr. Rafael',
    status: 'EM ATENDIMENTO',
    price: 450,
    duration: '45 min'
  },
  {
    id: 'tbl-3',
    time: '16:30',
    clientName: 'Camila Siqueira',
    clientPhone: '+55 11 99931-4501',
    clientInitials: 'CS',
    service: 'Bioestimulador de Colágeno',
    professional: 'Dra. Camila',
    status: 'AGENDADO',
    price: 1400,
    duration: '60 min'
  },
  {
    id: 'tbl-4',
    time: '17:15',
    clientName: 'Felipe Duarte',
    clientPhone: '+55 11 96328-7712',
    clientInitials: 'FD',
    service: 'Drenagem Linfática Facial',
    professional: 'Amanda',
    status: 'CONFIRMADO',
    price: 220,
    duration: '50 min'
  }
];

export const ATTENTION_ITEMS: AttentionItem[] = [
  {
    id: 'att-1',
    title: '5 agendamentos aguardando confirmação',
    badge: 'Ação imediata',
    badgeType: 'amber',
    icon: 'pending_actions',
    actionText: 'Confirmar horários'
  },
  {
    id: 'att-2',
    title: '3 pagamentos pendentes de aprovação',
    badge: 'R$ 540,00',
    badgeType: 'rose',
    icon: 'credit_card_off',
    actionText: 'Ver pagamentos'
  },
  {
    id: 'att-3',
    title: '8 clientes sem retorno há mais de 60 dias',
    badge: 'Reengajamento',
    badgeType: 'neutral',
    icon: 'person_search',
    actionText: 'Disparar mensagens'
  },
  {
    id: 'att-4',
    title: '2 produtos com estoque abaixo do mínimo',
    badge: 'Reposição',
    badgeType: 'orange',
    icon: 'inventory',
    actionText: 'Repor estoque'
  },
  {
    id: 'att-5',
    title: '1 assinatura com renovação pendente',
    badge: 'Plano VIP',
    badgeType: 'purple',
    icon: 'sync_problem',
    actionText: 'Renovar assinatura'
  }
];

export const PROFESSIONALS_DATA: Professional[] = [
  {
    id: 'prof-1',
    name: 'Dra. Fernanda',
    role: 'Biomédica Esteta',
    initials: 'DF',
    activeAppointments: 6,
    capacityPercent: 85,
    colorClass: 'bg-primary-container',
    photo: APP_IMAGES.anaCarolina
  },
  {
    id: 'prof-2',
    name: 'Dr. Rafael',
    role: 'Dermatologista',
    initials: 'DR',
    activeAppointments: 5,
    capacityPercent: 72,
    colorClass: 'bg-secondary',
    photo: APP_IMAGES.marcosOliveira
  },
  {
    id: 'prof-3',
    name: 'Dra. Camila',
    role: 'Harmonizadora Facial',
    initials: 'DC',
    activeAppointments: 4,
    capacityPercent: 64,
    colorClass: 'bg-tertiary',
    photo: APP_IMAGES.patriciaAlves
  },
  {
    id: 'prof-4',
    name: 'Amanda',
    role: 'Esteticista Corporal',
    initials: 'AM',
    activeAppointments: 3,
    capacityPercent: 48,
    colorClass: 'bg-on-surface-variant'
  }
];

export const CLIENTS_LIST: Client[] = [
  {
    id: 'cli-1',
    name: 'Mariana Silveira',
    phone: '+55 11 98452-1100',
    email: 'mariana.silveira@email.com',
    photo: APP_IMAGES.marianaSilveira,
    initials: 'MS',
    lastVisit: 'Hoje às 15:00',
    totalSpent: 4850,
    status: 'Ativo',
    favoriteService: 'Harmonização Facial'
  },
  {
    id: 'cli-2',
    name: 'Ana Carolina',
    phone: '+55 11 98123-4567',
    email: 'ana.carolina@email.com',
    photo: APP_IMAGES.anaCarolina,
    initials: 'AC',
    lastVisit: 'Hoje às 09:00',
    totalSpent: 1980,
    status: 'Ativo',
    favoriteService: 'Limpeza de pele profunda'
  },
  {
    id: 'cli-3',
    name: 'Marcos Oliveira',
    phone: '+55 11 97654-3210',
    email: 'marcos.oliveira@email.com',
    photo: APP_IMAGES.marcosOliveira,
    initials: 'MO',
    lastVisit: 'Hoje às 10:00',
    totalSpent: 1250,
    status: 'Ativo',
    favoriteService: 'Consulta dermatológica'
  },
  {
    id: 'cli-4',
    name: 'Patrícia Alves',
    phone: '+55 11 97777-3344',
    email: 'patricia.alves@email.com',
    photo: APP_IMAGES.patriciaAlves,
    initials: 'PA',
    lastVisit: 'Hoje às 13:00',
    totalSpent: 3400,
    status: 'Ativo',
    favoriteService: 'Bioestimulador de Colágeno'
  },
  {
    id: 'cli-5',
    name: 'Gabriel Santos',
    phone: '+55 11 97103-9944',
    email: 'gabriel.santos@email.com',
    initials: 'GS',
    lastVisit: 'Hoje às 15:45',
    totalSpent: 980,
    status: 'Ativo',
    favoriteService: 'Peeling Químico'
  },
  {
    id: 'cli-6',
    name: 'Camila Siqueira',
    phone: '+55 11 99931-4501',
    email: 'camila.s@email.com',
    initials: 'CS',
    lastVisit: 'Hoje às 16:30',
    totalSpent: 2600,
    status: 'Ativo',
    favoriteService: 'Bioestimulador de Colágeno'
  },
  {
    id: 'cli-7',
    name: 'Felipe Duarte',
    phone: '+55 11 96328-7712',
    email: 'felipe.duarte@email.com',
    initials: 'FD',
    lastVisit: 'Hoje às 17:15',
    totalSpent: 660,
    status: 'Novo',
    favoriteService: 'Drenagem Linfática Facial'
  },
  {
    id: 'cli-8',
    name: 'Larissa Menezes',
    phone: '+55 11 95412-8821',
    email: 'larissa.m@email.com',
    initials: 'LM',
    lastVisit: 'Há 38 dias',
    totalSpent: 1820,
    status: 'Sem retorno (+30d)',
    favoriteService: 'Preenchimento Labial'
  },
  {
    id: 'cli-9',
    name: 'Beatriz Fagundes',
    phone: '+55 11 94321-7711',
    email: 'beatriz.f@email.com',
    initials: 'BF',
    lastVisit: 'Há 65 dias',
    totalSpent: 3100,
    status: 'Sem retorno (+60d)',
    favoriteService: 'Harmonização Facial'
  }
];

export const SERVICES_CATALOG: ServiceItem[] = [
  {
    id: 'srv-1',
    name: 'Harmonização Facial Completa',
    category: 'Estética Avançada',
    duration: '90 min',
    price: 1800,
    description: 'Protocolo personalizado com ácido hialurônico para volumização e contorno mandibular.'
  },
  {
    id: 'srv-2',
    name: 'Bioestimulador de Colágeno',
    category: 'Estética Avançada',
    duration: '60 min',
    price: 1400,
    description: 'Estímulo de neocolagênese para rejuvenescimento e firmeza tecidual.'
  },
  {
    id: 'srv-3',
    name: 'Peeling Químico Médio',
    category: 'Dermatologia',
    duration: '45 min',
    price: 450,
    description: 'Renovação celular intensa para uniformização de tom e textura.'
  },
  {
    id: 'srv-4',
    name: 'Limpeza de Pele Profunda',
    category: 'Cuidados Básicos',
    duration: '60 min',
    price: 240,
    description: 'Extração por sucção, alta frequência e máscara calmante hidrolipídica.'
  },
  {
    id: 'srv-5',
    name: 'Consulta Dermatológica',
    category: 'Clínica Geral',
    duration: '45 min',
    price: 350,
    description: 'Diagnóstico clínico detalhado e prescrição de rotina de skincare médica.'
  },
  {
    id: 'srv-6',
    name: 'Drenagem Linfática Facial',
    category: 'Massoterapia',
    duration: '50 min',
    price: 220,
    description: 'Redução de edemas faciais e melhora expressiva da circulação linfática.'
  }
];
