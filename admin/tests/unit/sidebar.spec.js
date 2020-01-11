import { shallowMount } from '@vue/test-utils'
import Sidebar from '@/components/Sidebar.vue'

describe('Sidebar.vue', () => {
  it('renders props.counterClass when passed', async () => {
    const counterClass = 'new message'
    const wrapper = shallowMount(Sidebar, {
      propsData: { counterClass }
    })
    expect(wrapper.vm.counterClass).toBe('new messag')
  })
})
