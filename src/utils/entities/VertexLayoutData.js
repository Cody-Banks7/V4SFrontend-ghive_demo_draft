export class VertexLayoutData {
  x0
  x1
  y
  type
  /** @type {(number|string)[]} */
  vertexIdList

  /**
   * @param {number} x0
   * @param {number} x1
   * @param {number} y
   * @param {string} type
   * @param {(number|string)[]} [vertexIdList=[]]
   */
  constructor(x0, x1, y, type, vertexIdList=[]) {
    this.x0 = x0
    this.x1 = x1
    this.y = y
    this.type = type
    this.vertexIdList = vertexIdList
  }
}
