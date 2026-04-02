export const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case 'pending':              return 'bg-orange-100 text-orange-700'
    case 'in_process':           return 'bg-blue-100 text-blue-700'
    case 'approved':             return 'bg-green-100 text-green-700'
    case 'recommended_approval': return 'bg-yellow-100 text-yellow-700'
    case 'denied':               return 'bg-red-100 text-red-700'
    case 'released':             return 'bg-teal-100 text-teal-700'
    default:                     return 'bg-gray-100 text-gray-600'
  }
}

export const formatStatus = (status: string) => {
  switch (status) {
    case 'pending':              return 'Pending'
    case 'in_process':           return 'Received'
    case 'approved':             return 'Approved'
    case 'recommended_approval': return 'Pending Approval'
    case 'denied':               return 'Denied'
    case 'released':             return 'Released'
    default:                     return status
  }
}

export const getStepperCircleColor = (status: string) => {
  switch (status) {
    case 'pending':              return 'bg-orange-400 border-orange-400 shadow-[0_0_0_4px_rgba(251,146,60,0.2)]'
    case 'in_process':           return 'bg-blue-400 border-blue-400 shadow-[0_0_0_4px_rgba(96,165,250,0.2)]'
    case 'approved':             return 'bg-green-400 border-green-400 shadow-[0_0_0_4px_rgba(74,222,128,0.2)]'
    case 'recommended_approval': return 'bg-yellow-400 border-yellow-400 shadow-[0_0_0_4px_rgba(250,204,21,0.2)]'
    case 'denied':               return 'bg-red-400 border-red-400 shadow-[0_0_0_4px_rgba(239,68,68,0.2)]'
    case 'released':             return 'bg-teal-400 border-teal-400 shadow-[0_0_0_4px_rgba(45,212,191,0.2)]'
    case 'submitted':            return 'bg-blue-400 border-blue-400 shadow-[0_0_0_4px_rgba(96,165,250,0.2)]'
    default:                     return 'bg-gray-300 border-gray-300'
  }
}