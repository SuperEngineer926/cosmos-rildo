import React from 'react';
import Layout from '../../components/shared/layout';
import Notification from '../../components/shared/notification';
import PageBGImg from '../../components/shared/page-bg-img';
import MintTotalSupply from './total-supply';
import MintInfoCenter from './info-center';
import MintMessageCenter from './message-center';
import MintFooter from './footer';
import backgroundImage from '../../../public/images/pages-background/mint.png';

// NOTE: context is for testing ONLY. Remove once endpoint/contract is connected.
import { useMintContext } from './context';
import { useWindowDimensions } from '../../utils/hooks';

const Mint = () => {
  const { notification: { content, severity, title } } = useMintContext();
  const { windowWidth, windowHeight } = useWindowDimensions()
  return (
    <Layout>
      <div className="mint page-layout">
        <div className="mint--content">
          <MintMessageCenter />
          <div className="mint--content-summary">
            <MintInfoCenter />
            <MintTotalSupply />
          </div>
        </div>
        <MintFooter />
      </div>
      <PageBGImg
        alt="Mint page background image"
        className="page-bg-img--70"
        src={backgroundImage}
        styles={{
          opacity: windowWidth <= 700 ? 0.4 : 1,
          backgroundSize: windowWidth - 150 <= windowHeight ? '80% 100%' : 'contain',
        }}
      />
      <Notification
        className={{
          alert: 'mint-notification--alert',
          snackbar: 'mint-notification',
        }}
        content={content}
        severity={severity}
        title={title}
      />
    </Layout>
  )
};

export default Mint;
