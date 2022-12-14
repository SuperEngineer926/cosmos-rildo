import React from 'react';
import PageBGImg from '../../../../components/shared/page-bg-img';
import backgroundImage from '../../../../../public/images/pages-background/team.png';
import { useWindowDimensions } from '../../../../utils/hooks';

const AboutTab = () => {
  const { windowWidth } = useWindowDimensions()
  return (
    <>
      <div className="team--tabs-content page-layout">
        <h2>Who We Are <span>& What We Do</span></h2>
        <div className="team--tabs-content-summary">
          <p>The Camp Cosmos team is made up of artists, investors, and visionaries across various fields of skill and expertise. We believe the future of the internet is decentralized, and we are committed to pushing the boundaries of web3.</p>
        </div>
      </div>
      <PageBGImg
        alt="About page background image"
        src={backgroundImage}

        styles={{
          backgroundSize: windowWidth < 912 ? 'auto 50%' : '60% auto',
          backgroundPosition: windowWidth > 912 ? 'right bottom' : "bottom",
          opacity: windowWidth < 912 ? .4 : 1
        }}
      />
    </>
  )
};

export default AboutTab;
