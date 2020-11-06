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
import { Directory } from '../../generated/schema'

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

// Helper to udpdate the organizations lists
function updateOrganizations(directoryAddress: Address, updateRegistered: boolean, updateRequested: boolean): void {
  let directory = Directory.load(directoryAddress.toHexString())
  if(directory) {
    let directoryContact = ArbitrableDirectoryContract.bind(directoryAddress)
    let organizations: Bytes[]

    if(updateRegistered) {
      organizations = directoryContact.getOrganizations(BigInt.fromI32(0), BigInt.fromI32(0))
      directory.registeredOrganizations = organizations.map<string>((orgId: Bytes) => orgId.toHexString())
    }

    if(updateRequested) {
      organizations = directoryContact.getRequestedOrganizations(BigInt.fromI32(0), BigInt.fromI32(0))
      directory.pendingOrganizations = organizations.map<string>((orgId: Bytes) => orgId.toHexString())
    }
    
    directory.save()
  } else {
    log.error("updateOrganizations|Directory Not found|{}", [directoryAddress.toHexString()])
  }
}

// Handle the inclusion of a new organization in the directory
export function handleOrganizationAdded(event: OrganizationAdded): void {
  updateOrganizations(event.address, true, false)
}

// Handle the removal of an organization from the directory
export function handleOrganizationRemoved(event: OrganizationRemoved): void {
  updateOrganizations(event.address, true, false)
}

// Handle the request of an organization to join the directory
export function handleOrganizationSubmitted(event: OrganizationSubmitted): void {
  updateOrganizations(event.address, false, true)
}

// Handle the withdrawl of the request of an organization to join the directory
export function handleOrganizationRequestRemoved(event: OrganizationRequestRemoved): void {
  updateOrganizations(event.address, false, true)
}

/* TODO: Handle challenges and arbitration process */
export function handleOrganizationChallenged(event: OrganizationChallenged): void {}

export function handleRuling(event: Ruling): void {}

export function handleChallengeContributed(event: ChallengeContributed): void {}

export function handleDispute(event: Dispute): void {}

export function handleEvidence(event: Evidence): void {}

export function handleMetaEvidence(event: MetaEvidence): void {}