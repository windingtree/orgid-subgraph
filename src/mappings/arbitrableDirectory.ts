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
} from '../../generated/templates/ArbitrableDirectory/ArbitrableDirectory'

import { ArbitrableDirectory as ArbitrableDirectoryContract} from '../../generated/templates/ArbitrableDirectory/ArbitrableDirectory'
import { Directory } from '../../generated/schema'

export function handleDirectoryNameChanged(event: SegmentChanged): void {
  let directory = Directory.load(event.address.toHexString())
  if(directory) {
    directory.name = event.params._newSegment
  }
}

export function handleOrganizationAdded(event: OrganizationAdded): void {
  let directory = Directory.load(event.address.toHexString())
  if(directory) {
    directory.organizations.push(event.params._organization.toHexString())
  }
}

export function handleOrganizationChallenged(event: OrganizationChallenged): void {

}

export function handleOrganizationRemoved(event: OrganizationRemoved): void {}

export function handleOrganizationRequestRemoved(event: OrganizationRequestRemoved): void {}

export function handleOrganizationSubmitted(event: OrganizationSubmitted): void {}

export function handleRuling(event: Ruling): void {}

export function handleChallengeContributed(event: ChallengeContributed): void {}

export function handleDispute(event: Dispute): void {}

export function handleEvidence(event: Evidence): void {}

export function handleMetaEvidence(event: MetaEvidence): void {}