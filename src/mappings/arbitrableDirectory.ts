import { Address, Bytes, log, BigInt} from "@graphprotocol/graph-ts"
import {
  ChallengeContributed,
  Dispute,
  Evidence,
  MetaEvidence,
  OrganizationAdded,
  OrganizationChallenged,
  OrganizationRemoved,
  OrganizationRequestRemoved,
  OrganizationSubmitted,
  Ruling,
  SegmentChanged,
  ArbitrableDirectoryContract,
} from '../../generated/templates/ArbitrableDirectoryTemplate/ArbitrableDirectoryContract'
import { Organization, Directory } from '../../generated/schema'

// Handle a change of name of the directory
export function handleDirectoryNameChanged(event: SegmentChanged): void {
  let directory = Directory.load(event.address.toHexString())
  if(directory) {
    directory.segment = event.params._newSegment
    directory.save()
  } else {
    log.error("handleDirectoryNameChanged|Directory Not found|{}", [event.address.toHexString()])
  }
}

// Handle the request of an organization to join the directory
export function handleOrganizationSubmitted(event: OrganizationSubmitted): void {
  // Retrieve objects
  let directory = Directory.load(event.address.toHexString())
  let directoryContract = ArbitrableDirectoryContract.bind(event.address)
  let organization = Organization.load(event.params._organization.toHexString())

  // Check if all objects are present
  if((directory != null) && (directoryContract != null) && (organization != null)) {
    if(directory.pendingOrganizations == null) {
      directory.pendingOrganizations = []
    }

    // Need to use a local variable otherwise directory is not updated
    let pendingOrganizations = directory.pendingOrganizations
    pendingOrganizations.push(organization.id)
    directory.pendingOrganizations = pendingOrganizations

    directory.save()
    log.info("handleOrganizationSubmitted|Directory updated|{}|{}", [directory.id, organization.id])
  } else {
    log.error("handleOrganizationSubmitted|Directory or Organization Not found|{}|{}", [event.address.toHexString(), event.params._organization.toHexString()])
  }
}

// Handle the withdrawl of the request of an organization to join the directory
export function handleOrganizationRequestRemoved(event: OrganizationRequestRemoved): void {
  // Retrieve objects
  let directory = Directory.load(event.address.toHexString())
  let directoryContract = ArbitrableDirectoryContract.bind(event.address)
  let organization = Organization.load(event.params._organization.toHexString())

  // Check if all objects are present
  if((directory != null) && (directoryContract != null) && (organization != null)) {
    if((directory.pendingOrganizations == null) || (directory.pendingOrganizations.length == 0)){
      log.error("handleOrganizationRequestRemoved|Directory Empty|{}|{}", [event.address.toHexString(), event.params._organization.toHexString()])
    }

    else {
      // Need to use a local variable otherwise directory is not updated
      let pendingOrganizations = directory.pendingOrganizations
      let organizationIndex = pendingOrganizations.indexOf(organization.id)
      if(organizationIndex == -1) {
        log.error("handleOrganizationRequestRemoved|Organization not part of Directory|{}|{}", [event.address.toHexString(), event.params._organization.toHexString()])
      } else {
        pendingOrganizations.splice(organizationIndex, 1)
        directory.pendingOrganizations = pendingOrganizations
        directory.save()
        log.info("handleOrganizationRequestRemoved|Directory updated|{}|{}", [directory.id, organization.id])
      }
    }
  } else {
    log.error("handleOrganizationRequestRemoved|Directory or Organization Not found|{}|{}", [event.address.toHexString(), event.params._organization.toHexString()])
  }
}

// Handle the inclusion of a new organization in the directory
export function handleOrganizationAdded(event: OrganizationAdded): void {
  //updateOrganizations(event.address, true, true)
  let directory = Directory.load(event.address.toHexString())
  let directoryContract = ArbitrableDirectoryContract.bind(event.address)
  let organization = Organization.load(event.params._organization.toHexString())
  if((directory != null) && (directoryContract != null) && (organization != null)) {
    if(directory.registeredOrganizations == null) {
      directory.registeredOrganizations = []
    }
    // Need to use a local variable otherwise directory is not updated
    let registeredOrganizations = directory.registeredOrganizations
    registeredOrganizations.push(organization.id)
    directory.registeredOrganizations = registeredOrganizations

    directory.save()
    log.error("handleOrganizationAdded|Directory updated|{}|{}", [directory.id, organization.id])
  } else {
    log.error("handleOrganizationAdded|Directory or Organization Not found|{}|{}", [event.address.toHexString(), event.params._organization.toHexString()])
  }
}

// Handle the removal of an organization from the directory
export function handleOrganizationRemoved(event: OrganizationRemoved): void {
  // Retrieve objects
  let directory = Directory.load(event.address.toHexString())
  let directoryContract = ArbitrableDirectoryContract.bind(event.address)
  let organization = Organization.load(event.params._organization.toHexString())

  // Check if all objects are present
  if((directory != null) && (directoryContract != null) && (organization != null)) {
    if((directory.registeredOrganizations == null) || (directory.registeredOrganizations.length == 0)) {
      log.error("handleOrganizationRequestRemoved|Directory empty|{}|{}", [event.address.toHexString(), event.params._organization.toHexString()])
    }

    else {
      // Need to use a local variable otherwise directory is not updated
      let registeredOrganizations = directory.registeredOrganizations
      let organizationIndex = registeredOrganizations.indexOf(organization.id)
      if(organizationIndex == -1) {
        log.error("handleOrganizationRequestRemoved|Organization not in Directory|{}|{}", [event.address.toHexString(), event.params._organization.toHexString()])

      } else {
        registeredOrganizations.splice(organizationIndex, 1)
        directory.pendingOrganizations = registeredOrganizations
        directory.save()
        log.info("handleOrganizationRequestRemoved|Directory updated|{}|{}", [directory.id, organization.id])  
      }
    }
  } else {
    log.error("handleOrganizationRequestRemoved|Directory or Organization Not found|{}|{}", [event.address.toHexString(), event.params._organization.toHexString()])
  }
}



/* TODO: Handle challenges and arbitration process */
export function handleOrganizationChallenged(event: OrganizationChallenged): void {}

export function handleRuling(event: Ruling): void {}

export function handleChallengeContributed(event: ChallengeContributed): void {}

export function handleDispute(event: Dispute): void {}

export function handleEvidence(event: Evidence): void {}

export function handleMetaEvidence(event: MetaEvidence): void {}