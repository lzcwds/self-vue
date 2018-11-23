/**
 * Created by dy on 2018/11/13.
 *
 */

export default class VNode {
	tag;//当前节点的标签名
	data;//当前节点的数据对象
	children;//当前节点的子节点
	text;//一般文本节点或者注释节点会有该属性
	elm;//当前虚拟节点对应的真实节点
	ns;//节点的namespace
	context; // rendered in this component's scope
	key;
	componentOptions;
	componentInstance; // component instance
	parent; // component placeholder node

	// strictly internal
	raw; // contains raw HTML? (server only)
	isStatic; // hoisted static node
	isRootInsert; // necessary for enter transition check
	isComment; // empty comment placeholder?
	isCloned; // is a cloned node?
	isOnce; // is a v-once node?
	asyncFactory; // async component factory function
	asyncMeta;
	isAsyncPlaceholder;
	ssrContext;
	functionalContext; // real context vm for functional nodes
	functionalOptions; // for SSR caching
	functionalScopeId; // functioanl scope id support

	constructor(tag, data, children, text, elm, context, componentOptions, asyncFactory) {
		this.tag = tag
		this.data = data
		this.children = children
		this.text = text
		this.elm = elm
		this.ns = undefined
		this.context = context
		this.functionalContext = undefined
		this.functionalOptions = undefined
		this.functionalScopeId = undefined
		this.key = data && data.key
		this.componentOptions = componentOptions
		this.componentInstance = undefined
		this.parent = undefined
		this.raw = false
		this.isStatic = false
		this.isRootInsert = true
		this.isComment = false
		this.isCloned = false
		this.isOnce = false
		this.asyncFactory = asyncFactory
		this.asyncMeta = undefined
		this.isAsyncPlaceholder = false
	}

// DEPRECATED: alias for componentInstance for backwards compat.
	/* istanbul ignore next */
	get child() {
		return this.componentInstance
	}
}
/**
 *
 * @param text string = ''
 * @return {VNode}
 */
export const createEmptyVNode = (text) => {
	const node = new VNode()
	node.text = text
	node.isComment = true
	return node
}

/**
 *
 * @param val string | number
 * @return {VNode}
 */
export function createTextVNode(val) {
	return new VNode(undefined, undefined, undefined, String(val))
}

// optimized shallow clone
// used for static nodes and slot nodes because they may be reused across
// multiple renders, cloning them avoids errors when DOM manipulations rely
// on their elm reference.
/**
 *
 * @param vnode
 * @param deep
 * @return VNode
 */
export function cloneVNode(vnode, deep) {
	const cloned = new VNode(
			vnode.tag,
			vnode.data,
			vnode.children,
			vnode.text,
			vnode.elm,
			vnode.context,
			vnode.componentOptions,
			vnode.asyncFactory
	)
	cloned.ns = vnode.ns
	cloned.isStatic = vnode.isStatic
	cloned.key = vnode.key
	cloned.isComment = vnode.isComment
	cloned.isCloned = true
	if (deep && vnode.children) {
		cloned.children = cloneVNodes(vnode.children)
	}
	return cloned
}

/**
 *
 * @param vnodes Array<VNode>
 * @param deep boolean
 * @return Array<VNode>
 */
export function cloneVNodes(vnodes, deep) {
	const len = vnodes.length
	const res = new Array(len)
	for (let i = 0; i < len; i++) {
		res[i] = cloneVNode(vnodes[i], deep)
	}
	return res
}
