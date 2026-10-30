export class CultureSourceSystem {
  static verified(records) { return records.filter(r => r.confirmed && r.status === 'verified' && r.license === 'approved' && r.source && r.reviewer); }
  static pending(records) { return records.filter(r => !this.verified(records).includes(r)); }
}
