import { log, store } from "@graphprotocol/graph-ts"
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
import {
  Organization,
  Directory,
  Point,
  RegisteredDirectoryOrganization,
  RequestedDirectoryOrganization,
} from '../../generated/schema'

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
  let locationPoint = Point.load(event.params._organization.toHexString())

  // Check if all objects are present
  if((directory != null) && (directoryContract != null) && (organization != null)) {

    // Create the mapping entity that will derive fields
    let mappingEntityId = directory.id.concat('-').concat(organization.id)
    let mappingEntity = RequestedDirectoryOrganization.load(mappingEntityId)
    if(!mappingEntity) {
      // Add properties
      mappingEntity.directory = directory.id
      mappingEntity.organization = organization.id
      mappingEntity.segment = directory.segment

      // Add location
      if(locationPoint != null) {
        mappingEntity.latitude = locationPoint.latitude
        mappingEntity.longitude = locationPoint.longitude
      }
      mappingEntity.save()
      log.info("handleOrganizationSubmitted|Directory updated|{}|{}", [directory.id, organization.id])
    } else {
      log.error("handleOrganizationSubmitted|Organization is already part of Directory|{}|{}", [event.address.toHexString(), event.params._organization.toHexString()])
    }
    
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
    // Retrieve the mapping
    let mappingEntityId = directory.id.concat('-').concat(organization.id)
    let mappingEntity = RequestedDirectoryOrganization.load(mappingEntityId)
    if(!mappingEntity) {
      log.error("handleOrganizationRequestRemoved|Organization is not part of Directory|{}|{}", [event.address.toHexString(), event.params._organization.toHexString()])
    } else {
      // Remove the mapping entity
      store.remove('RequestedDirectoryOrganization', mappingEntityId)
      log.info("handleOrganizationRequestRemoved|Organization-Directory mapping removed|{}|{}", [event.address.toHexString(), event.params._organization.toHexString()])
    }

  } else {
    log.error("handleOrganizationRequestRemoved|Directory or Organization Not found|{}|{}", [event.address.toHexString(), event.params._organization.toHexString()])
  }
}

// Handle the inclusion of a new organization in the directory
export function handleOrganizationAdded(event: OrganizationAdded): void {
  // Retrieve objects
  let directory = Directory.load(event.address.toHexString())
  let directoryContract = ArbitrableDirectoryContract.bind(event.address)
  let organization = Organization.load(event.params._organization.toHexString())
  let locationPoint = Point.load(event.params._organization.toHexString())

  // Check if all objects are retrieved
  if((directory != null) && (directoryContract != null) && (organization != null)) {

    // Create the ID
    let mappingEntityId = directory.id.concat('-').concat(organization.id)
    let mappingEntity = RegisteredDirectoryOrganization.load(mappingEntityId)
    

    // Verify that the mapping does not already exist
    if(!mappingEntity) {
      // Create the mapping
      mappingEntity.directory = directory.id
      mappingEntity.organization = organization.id
      mappingEntity.segment = directory.segment

      // Add location
      if(locationPoint != null) {
        mappingEntity.latitude = locationPoint.latitude
        mappingEntity.longitude = locationPoint.longitude
      }

      mappingEntity.save()
      log.info("handleOrganizationAdded|Directory updated|{}|{}", [directory.id, organization.id])
    } else {
      log.error("handleOrganizationAdded|Organization is already part of Directory|{}|{}", [event.address.toHexString(), event.params._organization.toHexString()])
    }

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
    // Create the mapping ID
    let mappingEntityId = directory.id.concat('-').concat(organization.id)
    let mappingEntity = RegisteredDirectoryOrganization.load(mappingEntityId)

    // Check if mapping exists and remove it
    if(!mappingEntity) {
      log.error("handleOrganizationRemoved|Organization is not part of Directory|{}|{}", [event.address.toHexString(), event.params._organization.toHexString()])
    } else {
      store.remove('RegisteredDirectoryOrganization', mappingEntityId)
      log.info("handleOrganizationRemoved|Organization-Directory mapping removed|{}|{}", [event.address.toHexString(), event.params._organization.toHexString()])
    }

  } else {
    log.error("handleOrganizationRemoved|Directory or Organization Not found|{}|{}", [event.address.toHexString(), event.params._organization.toHexString()])
  }
}



/* TODO: Handle challenges and arbitration process */
export function handleOrganizationChallenged(event: OrganizationChallenged): void {}

export function handleRuling(event: Ruling): void {}

export function handleChallengeContributed(event: ChallengeContributed): void {}

export function handleDispute(event: Dispute): void {}

export function handleEvidence(event: Evidence): void {}

export function handleMetaEvidence(event: MetaEvidence): void {}