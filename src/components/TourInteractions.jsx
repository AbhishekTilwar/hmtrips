import CRMInteractions from './crm/CRMInteractions'

/**
 * Tour Interactions Component
 * Wrapper component that uses the unified CRM interactions
 * 
 * This component provides a clean interface for tour interactions
 * while using the optimized unified CRM system underneath
 */
export default function TourInteractions({ tour, variant = 'dark', onInteraction }) {
  return (
    <CRMInteractions 
      tour={tour} 
      variant={variant}
      onInteraction={onInteraction}
    />
  )
}