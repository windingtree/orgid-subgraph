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
} from '../../generated/templates/ArbitrableDirectoryTemplate/ArbitrableDirectoryContract'
import { log } from "@graphprotocol/graph-ts"

import { Directory } from '../../generated/schema'

export function handleDirectoryNameChanged(event: SegmentChanged): void {
  let directory = Directory.load(event.address.toHexString())
  if(directory) {
    directory.segment = event.params._newSegment
    directory.save()
  } else {
    log.error("handleDirectoryNameChanged|Directory Not found|{}", [event.address.toHexString()])
  }
}

export function handleOrganizationAdded(event: OrganizationAdded): void {
  let directory = Directory.load(event.address.toHexString())
  if(directory) {
    directory.registeredOrganizations.push(event.params._organization.toHexString())
    directory.save()
  } else {
    log.error("handleOrganizationAdded|Directory Not found|{}", [event.address.toHexString()])
  }
}

export function handleOrganizationChallenged(event: OrganizationChallenged): void {
  let directory = Directory.load(event.address.toHexString())
  if(directory) {
    directory.challengedOrganizations.push(event.params._organization.toHexString())
    directory.save()
  } else {
    log.error("handleOrganizationChallenged|Directory Not found|{}", [event.address.toHexString()])
  }
}

export function handleOrganizationSubmitted(event: OrganizationSubmitted): void {
  let directory = Directory.load(event.address.toHexString())
  if(directory) {
    directory.pendingOrganizations.push(event.params._organization.toHexString())
    directory.save()
  } else {
    log.error("handleOrganizationSubmitted|Directory Not found|{}", [event.address.toHexString()])
  }
}

export function handleOrganizationRemoved(event: OrganizationRemoved): void {
  let directory = Directory.load(event.address.toHexString())
  if(directory) {
    // Remove the organization from the list of registered organizations
    let organizationIndex = directory.registeredOrganizations.indexOf(event.params._organization.toHexString())
    directory.registeredOrganizations = directory.registeredOrganizations.splice(organizationIndex, 1)

    // Add it to the list of removed organizations (for archive)
    directory.removedOrganizations.push(event.params._organization.toHexString())
    directory.save()
  } else {
    log.error("handleOrganizationRemoved|Directory Not found|{}", [event.address.toHexString()])
  }
}

export function handleOrganizationRequestRemoved(event: OrganizationRequestRemoved): void {
  let directory = Directory.load(event.address.toHexString())
  if(directory) {
    // Remove the organization from the list of pending organizations
    let organizationIndex = directory.pendingOrganizations.indexOf(event.params._organization.toHexString())
    directory.pendingOrganizations = directory.pendingOrganizations.splice(organizationIndex, 1)
    directory.save()
  } else {
    log.error("handleOrganizationRequestRemoved|Directory Not found|{}", [event.address.toHexString()])
  }
}



export function handleRuling(event: Ruling): void {}

export function handleChallengeContributed(event: ChallengeContributed): void {}

export function handleDispute(event: Dispute): void {}

export function handleEvidence(event: Evidence): void {}

export function handleMetaEvidence(event: MetaEvidence): void {}