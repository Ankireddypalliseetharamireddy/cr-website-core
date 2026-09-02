import React from 'react';
import GrowthExpansion from './GrowthExpansion';
import DigitalExpansion from './DigitalExpansion';
import NationwideExpansion from './NationwideExpansion';
import CavreeCollections from './CavreeCollections';

export const HomePage = () => {
  return (
    <div className="home-page w-full overflow-x-hidden">

      <GrowthExpansion />

      <DigitalExpansion />

      <NationwideExpansion />

      <CavreeCollections />
    </div>
  );
};

export default HomePage;
