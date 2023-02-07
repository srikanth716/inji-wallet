import React, { useContext, useRef } from 'react';
import { useInterpret, useSelector } from '@xstate/react';
import {
  Pressable,
  Image,
  ImageBackground,
  Dimensions,
  View,
} from 'react-native';
import { CheckBox, Icon } from 'react-native-elements';
import { ActorRefFrom } from 'xstate';
import {
  createVcItemMachine,
  selectVerifiableCredential,
  selectGeneratedOn,
  vcItemMachine,
  selectContext,
  selectTag,
  selectEmptyWalletBindingId,
} from '../machines/vcItem';
import { Column, Row, Text } from './ui';
import { Theme } from './ui/styleUtils';
import { RotatingIcon } from './RotatingIcon';
import { GlobalContext } from '../shared/GlobalContext';
import { useTranslation } from 'react-i18next';
import { LocalizedField } from '../types/vc';
import { VcItemTags } from './VcItemTags';
import VerifiedIcon from './VerifiedIcon';

const getDetails = (arg1, arg2, verifiableCredential) => {
  if (arg1 === 'Status') {
    return (
      <Column>
        <Text
          weight="bold"
          size="smaller"
          color={
            !verifiableCredential
              ? Theme.Colors.LoadingDetailsLabel
              : Theme.Colors.DetailsLabel
          }>
          {arg1}
        </Text>
        <Row>
          <Text
            color={Theme.Colors.Details}
            weight="bold"
            size="smaller"
            style={
              !verifiableCredential
                ? Theme.Styles.loadingTitle
                : Theme.Styles.subtitle
            }>
            {!verifiableCredential ? '' : arg2}
          </Text>
          {!verifiableCredential ? null : <VerifiedIcon />}
        </Row>
      </Column>
    );
  } else if (arg1 === 'Full name') {
    return (
      <Column padding="0 200 0 0" margin="0 10 0 0">
        <Text
          color={
            !verifiableCredential
              ? Theme.Colors.LoadingDetailsLabel
              : Theme.Colors.DetailsLabel
          }
          weight="bold"
          size="smaller">
          {arg1}
        </Text>
        <Text
          numLines={4}
          color={Theme.Colors.Details}
          weight="bold"
          size="smaller"
          style={
            !verifiableCredential
              ? Theme.Styles.loadingTitle
              : Theme.Styles.subtitle
          }>
          {!verifiableCredential ? '' : arg2}
        </Text>
      </Column>
    );
  } else {
    return (
      <Column>
        <Text
          color={
            !verifiableCredential
              ? Theme.Colors.LoadingDetailsLabel
              : Theme.Colors.DetailsLabel
          }
          size="smaller"
          weight={'bold'}
          style={Theme.Styles.vcItemLabelHeader}>
          {arg1}
        </Text>
        <Text
          numLines={4}
          color={Theme.Colors.Details}
          weight="bold"
          size="smaller"
          style={
            !verifiableCredential
              ? Theme.Styles.loadingTitle
              : Theme.Styles.subtitle
          }>
          {!verifiableCredential ? '' : arg2}
        </Text>
      </Column>
    );
  }
};

const WalletVerified: React.FC = () => {
  return (
    <Icon
      name="verified-user"
      color={Theme.Colors.VerifiedIcon}
      size={28}
      containerStyle={{ marginStart: 4, bottom: 1 }}
    />
  );
};

const WalletUnverified: React.FC = () => {
  return (
    <Icon
      name="shield-alert"
      color={Theme.Colors.Icon}
      size={28}
      type="material-community"
      containerStyle={{ marginStart: 4, bottom: 1 }}
    />
  );
};

export const VcItem: React.FC<VcItemProps> = (props) => {
  const { appService } = useContext(GlobalContext);
  const { t } = useTranslation('VcDetails');
  const machine = useRef(
    createVcItemMachine(
      appService.getSnapshot().context.serviceRefs,
      props.vcKey
    )
  );

  const service = useInterpret(machine.current, { devTools: __DEV__ });
  const context = useSelector(service, selectContext);
  const verifiableCredential = useSelector(service, selectVerifiableCredential);
  const emptyWalletBindingId = useSelector(service, selectEmptyWalletBindingId);

  //Assigning the UIN and VID from the VC details to display the idtype label
  const uin = verifiableCredential?.credentialSubject.UIN;
  const vid = verifiableCredential?.credentialSubject.VID;

  const generatedOn = useSelector(service, selectGeneratedOn);
  const fullName = !verifiableCredential
    ? ''
    : getLocalizedField(verifiableCredential.credentialSubject.fullName);
  const isvalid = !verifiableCredential ? '' : t('valid');
  const selectableOrCheck = props.selectable ? (
    <CheckBox
      checked={props.selected}
      checkedIcon={<Icon name="radio-button-checked" />}
      uncheckedIcon={<Icon name="radio-button-unchecked" />}
      onPress={() => props.onPress(service)}
    />
  ) : null;

  const tag = useSelector(service, selectTag);

  return (
    <Pressable
      onPress={() => props.onPress(service)}
      disabled={!verifiableCredential}
      style={
        props.selected
          ? Theme.Styles.selectedBindedVc
          : Theme.Styles.closeCardBgContainer
      }>
      <ImageBackground
        source={!verifiableCredential ? null : Theme.CloseCard}
        resizeMode="stretch"
        borderRadius={4}
        style={
          !verifiableCredential
            ? Theme.Styles.vertloadingContainer
            : Theme.Styles.backgroundImageContainer
        }>
        {!verifiableCredential ? (
          <Column align="space-between" crossAlign="center" padding="50">
            <RotatingIcon name="sync" color={Theme.Colors.Icon} />
            <Text margin="20 0 0 0">{t('downloading')}</Text>
          </Column>
        ) : (
          <Column>
            <Row align="space-between">
              <Row>
                <Image
                  source={{ uri: context.credential.biometrics.face }}
                  style={Theme.Styles.closeCardImage}
                />
                <Column margin="0 0 0 10">
                  {getDetails(t('fullName'), fullName, verifiableCredential)}

                  <Column margin="10 0 0 0">
                    <Text
                      color={Theme.Colors.DetailsLabel}
                      weight="bold"
                      size="smaller"
                      align="left">
                      {t('idType')}
                    </Text>
                    <Text
                      weight="bold"
                      color={Theme.Colors.Details}
                      size="smaller"
                      style={Theme.Styles.subtitle}>
                      {t('nationalCard')}
                    </Text>
                  </Column>
                </Column>
              </Row>

              <Column>
                {verifiableCredential ? (
                  selectableOrCheck
                ) : (
                  <RotatingIcon name="sync" color={Theme.Colors.rotatingIcon} />
                )}
              </Column>
            </Row>

            <Row align="space-between" margin="5 0 0 0">
              <Column>
                {uin ? getDetails(t('uin'), uin, verifiableCredential) : null}
                {vid ? getDetails(t('vid'), vid, verifiableCredential) : null}
                {getDetails(
                  t('generatedOn'),
                  generatedOn,
                  verifiableCredential
                )}
              </Column>
              <Column>
                {getDetails(t('status'), isvalid, verifiableCredential)}
              </Column>
              <Column style={Theme.Styles.closecardMosipLogo}>
                <Image
                  source={Theme.MosipLogo}
                  style={Theme.Styles.logo}
                  resizeMethod="auto"
                />
              </Column>
            </Row>
          </Column>
        )}

        <VcItemTags tag={tag} />
      </ImageBackground>
      {props.activeTab !== 'receivedVcsTab' &&
        props.activeTab != 'sharingVcScreen' && (
          <Row>
            {emptyWalletBindingId ? (
              <Row
                width={Dimensions.get('screen').width * 0.8}
                align="space-between"
                crossAlign="center">
                <Row crossAlign="center" style={{ flex: 1 }}>
                  {verifiableCredential && <WalletUnverified />}
                  <Text
                    color={Theme.Colors.Details}
                    weight="semibold"
                    size="small"
                    margin="10 33 10 10"
                    style={
                      !verifiableCredential
                        ? Theme.Styles.loadingTitle
                        : Theme.Styles.statusLabel
                    }
                    children={t('offlineAuthDisabledHeader')}></Text>
                </Row>

                <Pressable
                  onPress={() =>
                    verifiableCredential ? props.onPress(service) : null
                  }>
                  <Icon
                    name="dots-three-horizontal"
                    type="entypo"
                    color={Theme.Colors.GrayIcon}
                  />
                </Pressable>
              </Row>
            ) : (
              <Row
                width={Dimensions.get('screen').width * 0.8}
                align="space-between"
                crossAlign="center">
                <Row crossAlign="center" style={{ flex: 1 }}>
                  <WalletVerified />
                  <Text
                    color={Theme.Colors.statusLabel}
                    weight="semibold"
                    size="smaller"
                    margin="10 10 10 10"
                    style={
                      !verifiableCredential
                        ? Theme.Styles.loadingTitle
                        : Theme.Styles.subtitle
                    }
                    children={t('profileAuthenticated')}></Text>
                </Row>

                {props.showOnlyBindedVc ? null : (
                  <Pressable onPress={() => props.onPress(service)}>
                    <Icon
                      name="dots-three-horizontal"
                      type="entypo"
                      color={Theme.Colors.GrayIcon}
                    />
                  </Pressable>
                )}
              </Row>
            )}
          </Row>
        )}
    </Pressable>
  );
};

interface VcItemProps {
  vcKey: string;
  margin?: string;
  selectable?: boolean;
  selected?: boolean;
  showOnlyBindedVc?: boolean;
  onPress?: (vcRef?: ActorRefFrom<typeof vcItemMachine>) => void;
  onShow?: (vcRef?: ActorRefFrom<typeof vcItemMachine>) => void;
  activeTab?: string;
}

function getLocalizedField(rawField: string | LocalizedField) {
  if (typeof rawField === 'string') {
    return rawField;
  }
  try {
    const locales: LocalizedField[] = JSON.parse(JSON.stringify(rawField));
    return locales[0].value;
  } catch (e) {
    return '';
  }
}
