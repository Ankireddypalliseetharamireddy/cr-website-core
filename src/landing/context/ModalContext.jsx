import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import BrochureModal from '../components/modals/BrochureModal';
import ConsultationModal from '../components/modals/ConsultationModal';
import CctvModal from '../components/modals/CctvModal';
import LocationCheckerModal from '../components/modals/LocationCheckerModal';

export const ModalContext = createContext({
  openBrochure: () => {},
  openConsultation: () => {},
  openCctv: () => {},
  openLocation: () => {},
});

export const useModal = () => useContext(ModalContext);

export const ModalProvider = ({ children }) => {
  const [isBrochureOpen, setIsBrochureOpen] = useState(false);
  const [isConsultationOpen, setIsConsultationOpen] = useState(false);
  const [isCctvOpen, setIsCctvOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);

  const openBrochure = useCallback(() => setIsBrochureOpen(true), []);
  const closeBrochure = useCallback(() => setIsBrochureOpen(false), []);

  const openConsultation = useCallback(() => setIsConsultationOpen(true), []);
  const closeConsultation = useCallback(() => setIsConsultationOpen(false), []);

  const openCctv = useCallback(() => setIsCctvOpen(true), []);
  const closeCctv = useCallback(() => setIsCctvOpen(false), []);

  const openLocation = useCallback(() => setIsLocationOpen(true), []);
  const closeLocation = useCallback(() => setIsLocationOpen(false), []);

  const contextValue = useMemo(
    () => ({
      openBrochure,
      openConsultation,
      openCctv,
      openLocation,
    }),
    [openBrochure, openConsultation, openCctv, openLocation]
  );

  return (
    <ModalContext.Provider value={contextValue}>
      {children}

      <BrochureModal isOpen={isBrochureOpen} onClose={closeBrochure} />
      <ConsultationModal isOpen={isConsultationOpen} onClose={closeConsultation} />
      <CctvModal isOpen={isCctvOpen} onClose={closeCctv} />
      <LocationCheckerModal isOpen={isLocationOpen} onClose={closeLocation} />
    </ModalContext.Provider>
  );
};

export default ModalProvider;
