import React, { useState } from 'react';
import styled, { css } from 'styled-components';
import determineColorForString from '../utils/determineColorForString';
import DockContainerState from './DockContainerState';
import useApi from '../hooks/useApi';
import { loading } from '../icons';
import { spin } from '../utils/animations';
import { isWebUri } from 'valid-url';
import { Link } from 'react-router-dom';

const DockContainerWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 1px solid #624694;
  @media all and (max-width: 450px) {
    flex-direction: column;
  }

  ${props => props.isRemoving && css`
  border-bottom: 0;
  background-color: #222;
  `}

`;

const StyledObjectLink = styled(({ ...props }) => <Link {...props} />)`
  display: flex;
  flex-direction: column;
  text-decoration: none;
  cursor: pointer;
`;

const ContainerNameWrapper = styled.div`
  display: flex;
  align-items: center;
  margin: 0.5rem 0;

`;

const ContainerName = styled.h2`
  color: #946ddc;
  margin: 0;
  padding: 0;

  @media all and (max-width: 450px) {
    font-size: 1.4rem;
  }
  `;

const ColorizedSpan = styled.span`
  color: ${props => props.color};
`;


const ContainerState = styled.div`
  display: flex;
  align-items: center;
`;

const ContainerTag = styled.span`
  margin-right: 10px;
  font-size: 1.8rem;
  color: ${props => props.color};
`;

const ContainerOptions = styled.div`
  display: flex;
  @media all and (max-width: 450px) {
    justify-content: space-around;
  }
  `;

const COMMON_ACTION_BUTTON_STYLES = `
  text-decoration: none;
  outline: 0;
  padding: 0.5rem 1rem;
  background-color: transparent;
  border: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.8rem;
  margin: 0 0.5rem;
  transition: all 0.15s ease-in-out;

  &:hover {
    transform: scale(1.05);
  }

  @media all and (max-width: 450px) {
    margin: 0.5rem;
  }
`

const StyledActionButton = styled.button`
  ${COMMON_ACTION_BUTTON_STYLES}
  `;

const SiteLink = styled.a`
  color: lightskyblue;
  ${COMMON_ACTION_BUTTON_STYLES}
`;

const Cancel = styled(StyledActionButton)`
  color: #dbdbdb;
`;


const Remove = styled(StyledActionButton)`
  color: salmon;
`;


const Restart = styled(StyledActionButton)`
  color: orange;
}
`;

const StyledMessage = styled.p`
  margin: 0.5rem 0;
  color: #fff;
`;

const Spinner = styled.span`
  svg {
    animation: ${spin} 4s infinite linear;
  }
`;

const RemoveWarn = styled.div`
  width: 100%;
  display: flex;
  padding: 1rem;
  background: #222;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  `;

const StyledWarnHeader = styled.h3`
  color: salmon;
  margin: 0;
`;

const StyledWarnText = styled.p`
  color: salmon;
  margin: 1rem;
`;

export default function DockInstance({ imageId, container, handleRefetch }) {
  
  if (!container) {
    return null;
  }

  const [isRemoving, setIsRemoving] = useState(false);
  
  // eslint-disable-next-line
  const [restartingContainer, restartResponse, err1, restartContainer] = useApi({
    endpoint: `images/${imageId}/containers/${container.name}/restart`,
    method: "POST",
    successDelay: 2000,
    onSuccess: () => {
     handleRefetch()
    }, 
  });

   // eslint-disable-next-line
  const [removingContainer, removeResponse, err2, removeContainer] = useApi({
    endpoint: `images/${imageId}/containers/${container.name}/delete`,
    method: "DELETE",
    successDelay: 2000,
    onSuccess: () => {
     handleRefetch()
    }, 
  });

  let containerHref = container.labels['dockwatch.container.url'] || '#';
  let isRemovable = container.labels['dockwatch.removable'] && container.labels['dockwatch.removable'].toUpperCase() === "TRUE";
  let isRestartable = container.labels['dockwatch.restartable'] && container.labels['dockwatch.restartable'].toUpperCase() === "TRUE";

  if(containerHref !== '#' && !isWebUri(containerHref)) {
    containerHref = "http://" + containerHref;
  }

  return (
    <div>
    <DockContainerWrapper isRemoving={isRemoving}>
    <StyledObjectLink to={`/${imageId}/${container.name}`}>
    <ContainerNameWrapper>
    <ContainerTag>
          { restartingContainer ? <Spinner>{loading}</Spinner> : null }
    </ContainerTag>
      <ContainerName>
        <ColorizedSpan color={determineColorForString(container.ip)}>{container.ip}</ColorizedSpan>
      </ContainerName>
      <DockContainerState container={container} />
    </ContainerNameWrapper>
      {
        removingContainer && <StyledMessage>Removing container..</StyledMessage>
      }
    </StyledObjectLink>
    {
      !isRemoving && (
        <ContainerOptions>
        {isRestartable && <Restart onClick={() => restartContainer()}>RESTART</Restart>}
        {isRemovable && <Remove onClick={() => setIsRemoving(true)}>REMOVE</Remove>}
        {containerHref !== '#' && <SiteLink href={containerHref}>VIEW SITE</SiteLink>}
      </ContainerOptions>
      )
    }
    </DockContainerWrapper>
    {
      isRemoving && (
        <RemoveWarn>
          <StyledWarnHeader>Confirm remove</StyledWarnHeader>
          <StyledWarnText>Warning: This action cannot be undone.</StyledWarnText>
          <ContainerOptions>
           <Cancel onClick={() => setIsRemoving(false)}>CANCEL</Cancel>
           <Remove onClick={() => removeContainer()}>REMOVE</Remove>
          </ContainerOptions>
        </RemoveWarn>
      )
    }
    </div>
  );
}
